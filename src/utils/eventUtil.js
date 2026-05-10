import { getUserData } from "./authUtil";

/**
 * Save event data to localStorage
 * @param {Object} eventData - Event data from API response
 */
export const saveEventData = (eventData) => {
  try {
    localStorage.setItem("currentEventData", JSON.stringify(eventData));
  } catch (error) {
    console.error("Error storing event data:", error);
  }
};

/**
 * Get current event data from localStorage
 * @returns {Object|null} Event data object or null if not found
 */
export const getEventData = () => {
  try {
    const eventData = localStorage.getItem("currentEventData");
    return eventData ? JSON.parse(eventData) : null;
  } catch (error) {
    console.error("Error retrieving event data:", error);
    return null;
  }
};

/**
 * Setup event data cleanup for page unload, tab close, and refresh
 * This function should be called once when your app initializes
 */
export const setupEventDataCleanup = () => {
  // Detect browser session using sessionStorage
  const sessionKey = "eventCreationSession";

  // Check if this is a new browser session (which includes page refresh)
  const isNewSession = !sessionStorage.getItem(sessionKey);

  if (isNewSession) {
    // This is either a page refresh or a new browser session
    const eventData = getEventData();

    // Only clear if we have a draft event (not a published one)
    if (eventData && eventData.publishStatus === "draft") {
      // Remove the draft event data
      clearEventData();
      console.log("Event data cleared on page refresh/new session");
    }

    // Mark this as a valid session
    sessionStorage.setItem(sessionKey, "true");
  }

  // Register an event listener for beforeunload event
  window.addEventListener("beforeunload", () => {
    // If there's an event in progress, mark it with timestamp
    const eventData = getEventData();
    if (eventData) {
      // Store the event data with a timestamp
      localStorage.setItem("eventDataLastAccessed", new Date().toISOString());
    }

    // Clear the session marker
    sessionStorage.removeItem(sessionKey);
  });
};

/**
 * Clear event data from localStorage
 */
export const clearEventData = () => {
  localStorage.removeItem("currentEventData");
};

/**
 * Check and clean up stale event data
 * Call this function when your app starts up
 * @param {number} expiryTimeMinutes - Time in minutes after which draft event data is considered stale
 */
export const checkAndCleanupEventData = (expiryTimeMinutes = 60) => {
  const lastAccessed = localStorage.getItem("eventDataLastAccessed");
  if (lastAccessed) {
    const lastAccessedDate = new Date(lastAccessed);
    const currentDate = new Date();

    // Calculate difference in milliseconds
    const timeDifference = currentDate - lastAccessedDate;

    // Convert to minutes
    const minutesDifference = timeDifference / (1000 * 60);

    // If more than specified minutes have passed, clear the event data
    if (minutesDifference > expiryTimeMinutes) {
      clearEventData();
      localStorage.removeItem("eventDataLastAccessed");
    }
  }
};

/**
 * Clear event data on logout
 * Call this function as part of your logout process
 */
export const clearEventDataOnLogout = () => {
  clearEventData();
  localStorage.removeItem("eventDataLastAccessed");
};

/**
 * Maps GetEvent API payload (nested `location` and/or flat `eventLocation*` fields) into
 * the shape expected by LocationStep — used by create and edit flows.
 * @param {Object} eventPayload - response.data from GetEventAPI
 * @returns {Object} Form location state
 */
export const mapEventApiPayloadToLocationForm = (eventPayload = {}) => {
  const locationPayload = eventPayload?.location || {};
  const ep = eventPayload;

  const firstString = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v);
      }
    }
    return "";
  };

  const firstCoord = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== "") {
        return String(v);
      }
    }
    return "";
  };

  const rawLocationType =
    locationPayload.locationType ||
    locationPayload.eventLocationType ||
    ep?.eventLocationType ||
    (locationPayload.isToBeAnnounced ? "tba" : "physical");

  const normalizedType = String(rawLocationType || "physical").toLowerCase();
  let locationTypeFromApi = "physical";
  if (normalizedType === "to_be_announced" || normalizedType === "tba") {
    locationTypeFromApi = "tba";
  } else if (normalizedType === "online") {
    locationTypeFromApi = "online";
  } else if (normalizedType === "private") {
    locationTypeFromApi = "private";
  } else if (normalizedType === "physical") {
    locationTypeFromApi = "physical";
  }

  const mergedDescriptionFromApi = firstString(
    locationPayload.additionalInfo,
    ep?.additionalInfo,
    ep?.eventLocationAdditionalInfo
  );

  const isOnlineType = String(locationTypeFromApi).toLowerCase() === "online";

  /**
   * Backend stores one `description` on EventLocation for online events, built from
   * onlineEventDescription + "\n\n" + additionalInfo when both exist. GET exposes it as
   * eventLocationAdditionalInfo only — so we split / route back into the two form fields.
   */
  const routeSingleSegmentOnlineBlob = (text) => {
    const t = String(text).trim();
    if (!t) return { join: "", extra: "" };
    const looksLikePrimaryJoin =
      /^https?:\/\//i.test(t) ||
      /\b(zoom\.us|meet\.google|teams\.microsoft|webex\.com|whereby\.com)\b/i.test(
        t
      );
    if (looksLikePrimaryJoin) return { join: t, extra: "" };
    return { join: "", extra: t };
  };

  const parseOnlineLocationBlob = (combined) => {
    if (!combined || !String(combined).trim()) {
      return { join: "", extra: "" };
    }
    const s = String(combined);
    const idx = s.indexOf("\n\n");
    if (idx >= 0) {
      return {
        join: s.slice(0, idx).trim(),
        extra: s.slice(idx + 2).trim(),
      };
    }
    return routeSingleSegmentOnlineBlob(s);
  };

  const explicitOnlineDesc = firstString(
    locationPayload.onlineEventDescription,
    ep?.onlineEventDescription
  );
  const explicitAdditionalOnline = firstString(
    locationPayload.additionalInfo,
    ep?.additionalInfo
  );

  const combinedOnlineBlob = firstString(
    ep?.eventLocationAdditionalInfo,
    locationPayload.eventLocationAdditionalInfo,
    locationPayload.description
  );

  let onlineJoinField = "";
  let onlineExtraField = "";

  if (isOnlineType) {
    if (explicitOnlineDesc !== "" || explicitAdditionalOnline !== "") {
      onlineJoinField = explicitOnlineDesc;
      onlineExtraField = explicitAdditionalOnline;
    } else {
      const parsed = parseOnlineLocationBlob(combinedOnlineBlob);
      onlineJoinField = parsed.join;
      onlineExtraField = parsed.extra;
    }
  }

  return {
    locationType: locationTypeFromApi,
    isToBeAnnounced:
      locationPayload.isToBeAnnounced != null
        ? Boolean(locationPayload.isToBeAnnounced)
        : locationTypeFromApi === "tba",
    isPrivateLocation:
      locationPayload.isPrivateLocation != null
        ? Boolean(locationPayload.isPrivateLocation)
        : locationTypeFromApi === "private",
    googleMapLink: firstString(
      locationPayload.googleMapLink,
      locationPayload.mapLink,
      ep?.googleMapLink,
      ep?.eventLocationGoogleMapLink
    ),
    venue: isOnlineType
      ? firstString(
          locationPayload.venue,
          locationPayload.venueName,
          ep?.eventLocationName,
          "Online Event"
        )
      : firstString(
          locationPayload.venue,
          locationPayload.venueName,
          locationPayload.eventLocationName,
          ep?.eventLocationName
        ),
    street: firstString(
      locationPayload.street,
      locationPayload.addressLine1,
      ep?.street,
      ep?.eventLocationStreet
    ),
    streetNumber: firstString(
      locationPayload.streetNumber,
      locationPayload.streetNo,
      ep?.streetNo,
      ep?.eventLocationStreetNumber
    ),
    city: firstString(
      locationPayload.city,
      ep?.city,
      ep?.eventLocationCity
    ),
    postalCode: firstString(
      locationPayload.postalCode,
      locationPayload.zipCode,
      ep?.postalCode,
      ep?.eventLocationPostalCode
    ),
    state: firstString(
      locationPayload.state,
      locationPayload.province,
      ep?.state,
      ep?.eventLocationState
    ),
    country: firstString(
      locationPayload.country,
      ep?.country,
      ep?.eventLocationCountry
    ),
    additionalInfo: isOnlineType ? onlineExtraField : mergedDescriptionFromApi,
    onlineEventUrl: isOnlineType
      ? firstString(
          locationPayload.onlineEventUrl,
          ep?.eventLocationAddress,
          locationPayload.address,
          ep?.address
        )
      : "",
    onlineEventDescription: isOnlineType ? onlineJoinField : "",
    latitude: firstCoord(
      locationPayload.latitude,
      locationPayload.lat,
      ep?.latitude,
      ep?.eventLocationLatitude
    ),
    longitude: firstCoord(
      locationPayload.longitude,
      locationPayload.lng,
      ep?.longitude,
      ep?.eventLocationLongitude
    ),
    formattedAddress: isOnlineType
      ? ""
      : firstString(
          locationPayload.formattedAddress,
          locationPayload.address,
          ep?.address,
          ep?.eventLocationAddress
        ),
  };
};

/**
 * Prepare location data for API submission
 * @param {Object} locationData - Location data from the form
 * @returns {Object} Formatted location data for API
 */
export const prepareLocationDataForAPI = (locationData) => {
  const userData = getUserData();
  const eventData = getEventData();
  const eventId = eventData?.eventId || 0;
  const updatedBy = userData?.id || eventData?.createdBy || 0;
  const lt = String(locationData.locationType || "physical").toLowerCase();

  if (lt === "online") {
    return {
      id: eventId,
      locationType: "online",
      eventLocationId: null,
      venueName: "",
      address: "",
      latitude: 0,
      longitude: 0,
      streetNo: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      googleMapLink: "",
      onlineEventUrl: (locationData.onlineEventUrl || "").trim(),
      onlineEventDescription: (locationData.onlineEventDescription || "").trim(),
      additionalInfo: (locationData.additionalInfo || "").trim(),
      updatedBy,
    };
  }

  return {
    id: eventId,
    locationType: locationData.locationType || "physical",
    eventLocationId: null, // This would be filled in on update
    venueName: locationData.venue || "",
    address: formatAddress(locationData),
    latitude: parseFloat(locationData.latitude) || 0,
    longitude: parseFloat(locationData.longitude) || 0,
    streetNo: locationData.streetNumber || "",
    street: locationData.street || "",
    city: locationData.city || "",
    state: locationData.state || "", // State is now always passed as null
    country: locationData.country || "", // Country is now hardcoded
    postalCode: locationData.postalCode || "",
    googleMapLink: locationData.googleMapLink || "",
    onlineEventUrl: "",
    onlineEventDescription: "",
    additionalInfo: locationData.additionalInfo || "",
    updatedBy,
  };
};

/**
 * Format address from location components
 * @param {Object} locationData - Location data
 * @returns {string} Formatted address
 */
const formatAddress = (locationData) => {
  const components = [];

  if (locationData.streetNumber) components.push(locationData.streetNumber);
  if (locationData.street) components.push(locationData.street);
  if (locationData.city) components.push(locationData.city);
  if (locationData.country) components.push(locationData.country);
  if (locationData.postalCode) components.push(locationData.postalCode);

  return components.join(", ");
};

// ✅ NEW: Helper function to convert local time to UTC and split it
const convertAndSplitUTC = (dateStr, timeStr) => {
  // If either part is missing, return null values
  if (!dateStr || !timeStr) {
    return { date: null, time: null };
  }

  // 1. Ensure time string has seconds
  const timeWithSeconds = timeStr.split(':').length === 3 ? timeStr : `${timeStr}:00`;
  
  // 2. Create a Date object from the local date and time
  const localDateTime = new Date(`${dateStr}T${timeWithSeconds}`);

  // 3. Convert to a UTC ISO string (e.g., "2025-10-04T12:37:01.123Z")
  const isoString = localDateTime.toISOString();

  // 4. Split the ISO string into date and time parts
  const utcDate = isoString.substring(0, 10); // "2025-10-04"
  const utcTime = isoString.substring(11, 19); // "12:37:01"

  return { date: utcDate, time: utcTime };
};


export const prepareDateTimeDataForAPI = (dateTimeData, eventId = null) => {
  const userData = getUserData();
  const eventData = getEventData();
  const eventDataId = eventId || eventData?.eventId || 0;

  // ✅ CHANGED: Convert start and end times to their UTC equivalents
  const { date: utcStartDate, time: utcStartTime } = convertAndSplitUTC(
    dateTimeData.startDate,
    dateTimeData.startTime
  );
  const { date: utcEndDate, time: utcEndTime } = convertAndSplitUTC(
    dateTimeData.endDate,
    dateTimeData.endTime
  );

  return {
    id: parseInt(eventDataId, 10),
    
    // Send the UTC date and time under the original keys
    startDate: utcStartDate || "",
    startTime: utcStartTime || "",
    endDate: utcEndDate || "",
    endTime: utcEndTime || "",

    // ✅ CRITICAL: Explicitly label the time as UTC
    timeZone: "UTC",

    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/**
 * Prepare description data for API submission
 * @param {string} description - Event description content
 * @param {string|number} eventId - Optional event ID to override stored value
 * @param {boolean} isPrivate - Whether the event is private
 * @returns {Object} Formatted description data for API
 */
export const prepareDescriptionDataForAPI = (
  description,
  eventId = null,
  isPrivate = false
) => {
  const userData = getUserData();
  const eventData = getEventData();

  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;

  // Create a short description by removing HTML tags and limiting to 150 chars
  const createShortDescription = (htmlText) => {
    // Remove HTML tags
    const plainText = htmlText.replace(/<[^>]*>/g, "");
    // Limit to 150 characters
    return plainText.substring(0, 150);
  };

  return {
    id: parseInt(eventDataId, 10), // Convert to integer if it's a string
    description: description || "",
    shortDescription: createShortDescription(description || ""),
    keywords: "", // Not used in current implementation, but required by API
    isPrivate: isPrivate,
    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/**
 * Prepare art/image data for API submission
 * @param {Object} artData - Art data containing file information
 * @param {string|number} eventId - Optional event ID to override stored value
 * @param {string} imageType - Type of image ('thumbnail' or 'banner')
 * @returns {Object} Formatted JSON data for API
 */
export const prepareArtDataForAPI = (
  artData,
  eventId = null,
  imageType = "banner"
) => {
  const userData = getUserData();
  const eventData = getEventData();

  const eventDataId = eventId || eventData?.eventId || 0;

  return {
    id: parseInt(eventDataId, 10),
    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/**
 * Prepare tickets data for API submission
 * @param {Array} tickets - Array of ticket objects
 * @param {string|number} eventId - Optional event ID to override stored value
 * @returns {Object} Formatted tickets data for API
 */
export const prepareTicketsDataForAPI = (tickets, eventId = null) => {
  const userData = getUserData();
  const eventData = getEventData();

  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;

  // Get the main event's date and time for fallback logic
  const eventDateTime = eventData?.dateTime || {};

  // ✅ Helper to format provided date & time into ISO string
  const formatToISO = (date, time) => {
    if (!date || !time) return null;
    const paddedTime = time.includes(':') ? time : `${time}:00`;
    return `${date}T${paddedTime}:00.000Z`;
  };

  // ✅ Fallback to 12 hours ago from now (current system time)
  const fallbackListingStartTime = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  return {
    id: parseInt(eventDataId, 10),
    ticketStructures: tickets.map((ticket) => {
      const maxPurchase = parseInt(ticket.maxPurchaseAmount, 10);

      const listingStartTime =
        formatToISO(ticket.salesStartDate, ticket.salesStartTime) ||
        fallbackListingStartTime;

      const listingEndTime =
        formatToISO(ticket.salesEndDate, ticket.salesEndTime) ||
        formatToISO(eventDateTime.endDate, eventDateTime.endTime);

      const depRaw = ticket.startsAfterTicketStructureId;
      const startsAfterTicketStructureId =
        depRaw != null && depRaw !== "" && Number.isFinite(Number(depRaw))
          ? parseInt(depRaw, 10)
          : null;

      return {
        id: ticket.id || null,
        name: ticket.name,
        price: parseFloat(ticket.price),
        finalPrice: parseFloat(ticket.price),
        ticketCapacity:
        ticket.quantity === "No Limit" ? 0 : parseInt(ticket.quantity),
        maxPurchasePerOrder: !isNaN(maxPurchase) && maxPurchase > 0 ? maxPurchase : 0,
        currency: "NZD",
        limitedQuantity: ticket.quantity !== "No Limit",
        description: ticket.description || null,
        listingStartTime: listingStartTime,
        listingEndTime: listingEndTime,
        startsAfterTicketStructureId,
        toBeDeleted: false,
      };
    }),
    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/**
 * Prepare discount codes data for API submission
 * @param {Array} discountCodes - Array of discount code objects
 * @param {string|number} eventId - Optional event ID to override stored value
 * @returns {Object} Formatted discount codes data for API
 */
export const prepareDiscountCodesDataForAPI = (
  discountCodes,
  eventId = null
) => {
  const userData = getUserData();
  const eventData = getEventData();

  const eventDataId = eventId || eventData?.eventId || 0;

  // Helper to format provided date & time into ISO string
  const formatToISO = (date, time) => {
    if (!date || !time) return null;
    const paddedTime = time.includes(':') ? time : `${time}:00`;
    return `${date}T${paddedTime}:00.000Z`;
  };

  // Fallback to 12 hours ago from now (current system time)
  const fallbackValidFrom = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  // Get the main event's date and time for fallback logic
  const eventDateTime = eventData?.dateTime || {};

  return {
    id: parseInt(eventDataId, 10),
    discountCodes: discountCodes.map((code) => {
      // Create a list of ticket IDs applicable to this discount code
      const ticketsApplicable = code.ticketsApplicable.map((ticketId) =>
        parseInt(ticketId, 10)
      );

      const validFrom =
        formatToISO(code.validFromDate, code.validFromTime) || fallbackValidFrom;
      
      const validUntil =
        formatToISO(code.validUntilDate, code.validUntilTime) ||
        formatToISO(eventDateTime.startDate, eventDateTime.startTime);

      return {
        id: code.id || null, 
        code: code.code,
        type: code.type, 
        value: parseFloat(code.value),
        validFrom: validFrom,
        validUntil: validUntil,
        usageLimit: parseInt(code.usageLimit, 10) || 0,
        isActive: true, 
        isDeleted: false,
        ticketsApplicable: ticketsApplicable,
      };
    }),
    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/**
 * Prepare publish event data for API submission
 * @param {string|number} eventId - Optional event ID to override stored value
 * @returns {Object} Formatted publish data for API
 */
export const preparePublishEventDataForAPI = (eventId = null) => {
  const userData = getUserData();
  const eventData = getEventData();

  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;

  return {
    id: parseInt(eventDataId, 10), // Convert to integer if it's a string
    publishEvent: true,
    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/**
 * True when all creation steps 1–7 are done and step 8 (publish) is not completed yet.
 * Matches backend flags from GetEventStatusAPI.
 * @param {Object|null|undefined} statusData - response.data from GetEventStatusAPI
 * @returns {boolean}
 */
export const isCreationReadyForPublish = (statusData) => {
  if (!statusData) return false;
  const {
    step1Completed,
    step2Completed,
    step3Completed,
    step4Completed,
    step5Completed,
    step6Completed,
    step7Completed,
    step8Completed,
  } = statusData;
  return Boolean(
    step1Completed &&
      step2Completed &&
      step3Completed &&
      step4Completed &&
      step5Completed &&
      step6Completed &&
      step7Completed &&
      !step8Completed
  );
};