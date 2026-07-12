import { getUserData } from "./authUtil";
import {
  localWallClockToUtcStorage,
  localWallClockToInstant,
  instantToLocalWallClock,
  resolveEventTimezone,
  eventEndInstantFromFormDateTime,
} from "./datetimeUtil";

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
          ep?.eventLocationMeetingUrl,
          ep?.eventLocationAddress,
          locationPayload.address,
          ep?.address
        )
      : "",
    /** Hybrid / in-person + virtual: stored in API `onlineEventUrl` when location type is public/private */
    virtualMeetingUrl: !isOnlineType
      ? firstString(
          locationPayload.virtualMeetingUrl,
          locationPayload.onlineEventUrl,
          ep?.eventLocationMeetingUrl,
          ep?.onlineEventUrl
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
    eventLocationId:
      locationPayload.eventLocationId ??
      ep?.eventLocationId ??
      null,
  };
};

const TBA_PLACEHOLDER_VENUE = /^to be announced$/i;
const TBA_PLACEHOLDER_DESCRIPTION =
  /location details will be announced closer to the event date/i;

/**
 * Removes backend TBA placeholder text when switching to a concrete location type.
 * @param {Object} location
 * @returns {Object}
 */
export const clearTbaPlaceholderLocationFields = (location = {}) => {
  const next = { ...location };
  if (TBA_PLACEHOLDER_VENUE.test(String(next.venue ?? "").trim())) {
    next.venue = "";
  }
  if (TBA_PLACEHOLDER_DESCRIPTION.test(String(next.additionalInfo ?? "").trim())) {
    next.additionalInfo = "";
  }
  return next;
};

/** Default LocationStep form state from API or parent `eventData.location`. */
export const buildLocationFormState = (data = {}) => {
  const state = {
    locationType: data.locationType || "physical",
    isToBeAnnounced: Boolean(data.isToBeAnnounced),
    isPrivateLocation: Boolean(data.isPrivateLocation),
    eventLocationId: data.eventLocationId ?? null,
    googleMapLink: data.googleMapLink || "",
    venue: data.venue || "",
    street: data.street || "",
    streetNumber: data.streetNumber || "",
    city: data.city || "",
    postalCode: data.postalCode || "",
    state: data.state || "",
    country: data.country || "",
    additionalInfo: data.additionalInfo || "",
    onlineEventUrl: data.onlineEventUrl || "",
    onlineEventDescription: data.onlineEventDescription || "",
    virtualMeetingUrl: data.virtualMeetingUrl || "",
    latitude: data.latitude ?? "",
    longitude: data.longitude ?? "",
    formattedAddress: data.formattedAddress || "",
  };

  const isPhysicalOrPrivate =
    !state.isToBeAnnounced &&
    state.locationType !== "tba" &&
    state.locationType !== "online";

  return isPhysicalOrPrivate ? clearTbaPlaceholderLocationFields(state) : state;
};

/** @returns {'inPerson'|'online'|'tba'} */
export const getLocationModeKey = (location = {}) => {
  if (location.isToBeAnnounced || location.locationType === "tba") {
    return "tba";
  }
  if (location.locationType === "online") {
    return "online";
  }
  return "inPerson";
};

const IN_PERSON_DRAFT_KEYS = [
  "eventLocationId",
  "googleMapLink",
  "venue",
  "street",
  "streetNumber",
  "city",
  "postalCode",
  "state",
  "country",
  "additionalInfo",
  "virtualMeetingUrl",
  "latitude",
  "longitude",
  "formattedAddress",
];

const ONLINE_DRAFT_KEYS = [
  "onlineEventUrl",
  "onlineEventDescription",
  "additionalInfo",
];

const TBA_DRAFT_KEYS = ["additionalInfo"];

/**
 * Snapshot fields for one location mode so switching types can restore unsaved edits.
 * @param {Object} location
 * @param {'inPerson'|'online'|'tba'} modeKey
 */
export const pickLocationModeFields = (location = {}, modeKey) => {
  const keys =
    modeKey === "online"
      ? ONLINE_DRAFT_KEYS
      : modeKey === "tba"
        ? TBA_DRAFT_KEYS
        : IN_PERSON_DRAFT_KEYS;

  return keys.reduce((draft, key) => {
    draft[key] = location[key] ?? (key === "eventLocationId" ? null : "");
    return draft;
  }, {});
};

/**
 * Build LocationStep state after changing location type, restoring per-mode drafts.
 * @param {Object} prev - Current form state
 * @param {string} type - Target type: physical, private, online, tba
 * @param {Object} drafts - Map of modeKey -> field snapshot
 */
export const buildLocationStateForTypeChange = (prev, type, drafts = {}) => {
  const fromMode = getLocationModeKey(prev);
  const nextDrafts = {
    ...drafts,
    [fromMode]: pickLocationModeFields(prev, fromMode),
  };

  const isTba = type === "tba";
  const nextMode = isTba ? "tba" : type === "online" ? "online" : "inPerson";

  const inPersonDraft = nextDrafts.inPerson || {};
  const onlineDraft = nextDrafts.online || {};
  const tbaDraft = nextDrafts.tba || {};
  const activeDraft =
    nextMode === "online"
      ? onlineDraft
      : nextMode === "tba"
        ? tbaDraft
        : inPersonDraft;

  let next = {
    eventLocationId:
      inPersonDraft.eventLocationId ?? prev.eventLocationId ?? null,
    locationType: isTba ? "tba" : type,
    isToBeAnnounced: isTba,
    isPrivateLocation: type === "private",
    googleMapLink: inPersonDraft.googleMapLink ?? "",
    venue: inPersonDraft.venue ?? "",
    street: inPersonDraft.street ?? "",
    streetNumber: inPersonDraft.streetNumber ?? "",
    city: inPersonDraft.city ?? "",
    postalCode: inPersonDraft.postalCode ?? "",
    state: inPersonDraft.state ?? "",
    country: inPersonDraft.country ?? "",
    virtualMeetingUrl: inPersonDraft.virtualMeetingUrl ?? "",
    latitude: inPersonDraft.latitude ?? "",
    longitude: inPersonDraft.longitude ?? "",
    formattedAddress: inPersonDraft.formattedAddress ?? "",
    onlineEventUrl: onlineDraft.onlineEventUrl ?? "",
    onlineEventDescription: onlineDraft.onlineEventDescription ?? "",
    additionalInfo: activeDraft.additionalInfo ?? "",
  };

  if (!isTba && fromMode === "tba") {
    next = clearTbaPlaceholderLocationFields(next);
  }

  return { next, drafts: nextDrafts };
};

export const serializeLocationFormState = (location = {}) =>
  JSON.stringify(buildLocationFormState(location));

const SHORT_GOOGLE_MAP_LINK =
  /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)/i;

/**
 * Extract lat/lng from common Google Maps URL formats.
 * @param {string} url
 * @returns {{ lat: number, lng: number } | null}
 */
export const parseCoordsFromGoogleMapsUrl = (url) => {
  const trimmedUrl = String(url || "").trim();
  if (!trimmedUrl) {
    return null;
  }

  let match = trimmedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match?.length >= 3) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  match = trimmedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match?.length >= 3) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  match = trimmedUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match?.length >= 3) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  return null;
};

/**
 * Store a compact link when possible. Long search-bar URLs exceed DB limits and
 * are replaced with a canonical @lat,lng link when coordinates are known.
 * @param {string} url
 * @param {number|string|null|undefined} lat
 * @param {number|string|null|undefined} lng
 * @returns {string}
 */
export const normalizeGoogleMapLink = (url, lat, lng) => {
  const trimmed = String(url || "").trim();
  if (!trimmed) {
    return "";
  }

  const parsedLat = lat != null && lat !== "" ? parseFloat(lat) : NaN;
  const parsedLng = lng != null && lng !== "" ? parseFloat(lng) : NaN;
  const fromUrl = parseCoordsFromGoogleMapsUrl(trimmed);
  const useLat = Number.isFinite(parsedLat) ? parsedLat : fromUrl?.lat;
  const useLng = Number.isFinite(parsedLng) ? parsedLng : fromUrl?.lng;

  if (Number.isFinite(useLat) && Number.isFinite(useLng)) {
    return `https://www.google.com/maps/@${useLat},${useLng},17z`;
  }

  if (SHORT_GOOGLE_MAP_LINK.test(trimmed) || trimmed.length <= 512) {
    return trimmed;
  }

  const placeMatch = trimmed.match(
    /^(https:\/\/www\.google\.com\/maps\/place\/[^/@?]+)/i
  );
  if (placeMatch) {
    return placeMatch[1];
  }

  return trimmed.slice(0, 2048);
};

/** @param {string} url */
export const isShortGoogleMapLink = (url) =>
  SHORT_GOOGLE_MAP_LINK.test(String(url || "").trim());

/**
 * Build a geocoder query from structured address fields.
 * @param {Object} location
 * @returns {string}
 */
export const buildAddressGeocodeQuery = (location = {}) => {
  const parts = [
    location.streetNumber,
    location.street,
    location.city,
    location.state,
    location.postalCode,
    location.country,
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);

  return parts.length >= 2 ? parts.join(", ") : "";
};

/**
 * Prepare location data for API submission
 * @param {Object} locationData - Location data from the form
 * @param {string|number|null} eventId - Optional event ID override
 * @returns {Object} Formatted location data for API
 */
export const prepareLocationDataForAPI = (locationData, eventId = null) => {
  const userData = getUserData();
  const eventData = getEventData();
  const resolvedEventId =
    eventId || eventData?.eventId || eventData?.id || 0;
  const updatedBy = userData?.id || eventData?.createdBy || 0;
  const eventLocationId =
    locationData?.eventLocationId ?? eventData?.eventLocationId ?? null;
  const lt = String(locationData.locationType || "physical").toLowerCase();

  if (lt === "online") {
    return {
      id: resolvedEventId,
      locationType: "online",
      eventLocationId,
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
    id: resolvedEventId,
    locationType: locationData.locationType || "physical",
    eventLocationId,
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
    googleMapLink: normalizeGoogleMapLink(
      locationData.googleMapLink,
      locationData.latitude,
      locationData.longitude
    ),
    onlineEventUrl: (locationData.virtualMeetingUrl || "").trim(),
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

export const prepareDateTimeDataForAPI = (dateTimeData, eventId = null) => {
  const userData = getUserData();
  const eventData = getEventData();
  const eventDataId = eventId || eventData?.eventId || 0;
  const timezone = resolveEventTimezone(dateTimeData.timezone);

  const { date: utcStartDate, time: utcStartTime } = localWallClockToUtcStorage(
    dateTimeData.startDate,
    dateTimeData.startTime,
    timezone
  );
  const { date: utcEndDate, time: utcEndTime } = localWallClockToUtcStorage(
    dateTimeData.endDate,
    dateTimeData.endTime,
    timezone
  );

  return {
    id: parseInt(eventDataId, 10),
    startDate: utcStartDate || "",
    startTime: utcStartTime || "",
    endDate: utcEndDate || "",
    endTime: utcEndTime || "",
    timeZone: timezone,
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
 * Format ticket sale date + time for API. Returns null when either part is missing.
 */
export const formatTicketDateTimeForAPI = (dateString, timeString, timezone) => {
  return localWallClockToInstant(dateString, timeString, timezone);
};

/**
 * Map API ticket structure to step/modal ticket shape.
 * Empty sale fields mean the organizer did not set custom sale windows.
 */
export const mapTicketStructureToStepTicket = (ticket = {}, timezone) => {
  const timeZone = resolveEventTimezone(timezone);
  const startLocal = instantToLocalWallClock(ticket.listingStartTime, timeZone);
  const endLocal = instantToLocalWallClock(ticket.listingEndTime, timeZone);

  const isDonation = String(ticket.ticketKind || "").toUpperCase() === "DONATION";
  let suggestedAmounts = [];
  if (Array.isArray(ticket.suggestedAmounts)) {
    suggestedAmounts = ticket.suggestedAmounts;
  } else if (typeof ticket.suggestedAmounts === "string" && ticket.suggestedAmounts.trim()) {
    try {
      const parsed = JSON.parse(ticket.suggestedAmounts);
      suggestedAmounts = Array.isArray(parsed) ? parsed : [];
    } catch {
      suggestedAmounts = ticket.suggestedAmounts
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  return {
    id: ticket.id,
    name: ticket.name || "",
    price: ticket.price ?? "",
    quantity: isDonation
      ? "No Limit"
      : ticket.limitedQuantity
        ? ticket.ticketCapacity
        : "No Limit",
    maxPurchaseAmount: isDonation
      ? ""
      : ticket.maxPurchasePerOrder && ticket.maxPurchasePerOrder > 0
        ? ticket.maxPurchasePerOrder
        : "",
    salesStartDate: startLocal.date,
    salesStartTime: startLocal.time,
    salesEndDate: endLocal.date,
    salesEndTime: endLocal.time,
    startsAfterTicketStructureId: isDonation
      ? null
      : ticket.startsAfterTicketStructureId != null
        ? ticket.startsAfterTicketStructureId
        : null,
    description: ticket.description || "",
    soldOutOverride: Boolean(ticket.soldOutOverride),
    ticketKind: isDonation ? "DONATION" : "STANDARD",
    suggestedAmounts,
    donationRequired: Boolean(ticket.donationRequired),
    isActive: ticket.isActive !== false,
    isAdvance: false,
    advanceAmount: "",
  };
};

/**
 * Map step/modal ticket to API payload. Null listing times use platform defaults at purchase time.
 */
export const mapStepTicketToApiPayload = (ticket, timezone) => {
  const timeZone = resolveEventTimezone(timezone);
  const isDonation = String(ticket.ticketKind || "").toUpperCase() === "DONATION";
  const depRaw = ticket.startsAfterTicketStructureId;
  const startsAfterTicketStructureId =
    !isDonation && depRaw != null && depRaw !== "" && Number.isFinite(Number(depRaw))
      ? parseInt(depRaw, 10)
      : null;

  const suggestedAmounts = Array.isArray(ticket.suggestedAmounts)
    ? ticket.suggestedAmounts
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v >= 0)
    : [];

  return {
    name: ticket.name,
    price: parseFloat(ticket.price),
    finalPrice: parseFloat(ticket.price),
    ticketCapacity: isDonation
      ? 0
      : ticket.quantity === "No Limit"
        ? 0
        : parseInt(ticket.quantity, 10),
    maxPurchasePerOrder: isDonation
      ? null
      : ticket.maxPurchaseAmount
        ? parseInt(ticket.maxPurchaseAmount, 10)
        : 0,
    currency: "NZD",
    limitedQuantity: isDonation ? false : ticket.quantity !== "No Limit",
    description: ticket.description || null,
    listingStartTime: formatTicketDateTimeForAPI(
      ticket.salesStartDate,
      ticket.salesStartTime,
      timeZone
    ),
    listingEndTime: formatTicketDateTimeForAPI(
      ticket.salesEndDate,
      ticket.salesEndTime,
      timeZone
    ),
    startsAfterTicketStructureId,
    soldOutOverride: isDonation ? false : Boolean(ticket.soldOutOverride),
    ticketKind: isDonation ? "DONATION" : "STANDARD",
    suggestedAmounts: isDonation ? JSON.stringify(suggestedAmounts) : null,
    donationRequired: isDonation ? Boolean(ticket.donationRequired) : false,
    isActive: ticket.isActive !== false,
    isDeleted: false,
  };
};

/**
 * Prepare tickets data for API submission
 * @param {Array} tickets - Array of ticket objects
 * @param {string|number} eventId - Optional event ID to override stored value
 * @returns {Object} Formatted tickets data for API
 */
export const prepareTicketsDataForAPI = (tickets, eventId = null, timezone) => {
  const userData = getUserData();
  const eventData = getEventData();
  const eventDataId = eventId || eventData?.eventId || 0;
  const timeZone = resolveEventTimezone(timezone || eventData?.dateTime?.timezone);

  return {
    id: parseInt(eventDataId, 10),
    ticketStructures: tickets.map((ticket) => {
      const isDonation = String(ticket.ticketKind || "").toUpperCase() === "DONATION";
      const maxPurchase = parseInt(ticket.maxPurchaseAmount, 10);
      const apiTicket = mapStepTicketToApiPayload(ticket, timeZone);

      return {
        id: ticket.id || null,
        ...apiTicket,
        ticketCapacity: apiTicket.ticketCapacity,
        maxPurchasePerOrder: isDonation
          ? null
          : !isNaN(maxPurchase) && maxPurchase > 0
            ? maxPurchase
            : 0,
        toBeDeleted: false,
      };
    }),
    updatedBy: userData?.id || eventData?.createdBy || 0,
  };
};

/** Stored when organizers leave usage limit blank (unlimited redemptions). */
export const UNLIMITED_DISCOUNT_USAGE = 2147483647;

/**
 * Parse organizer usage limit for API. Blank/zero means unlimited.
 */
export const parseUsageLimitForAPI = (usageLimit) => {
  if (usageLimit === null || usageLimit === undefined || String(usageLimit).trim() === "") {
    return null;
  }
  const parsed = parseInt(String(usageLimit), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
};

/**
 * Format API usage limit for UI. Unlimited values show as blank.
 */
export const formatUsageLimitForUI = (usageLimit) => {
  if (
    usageLimit === null ||
    usageLimit === undefined ||
    usageLimit === "" ||
    Number(usageLimit) <= 0 ||
    Number(usageLimit) >= UNLIMITED_DISCOUNT_USAGE
  ) {
    return "";
  }
  return String(usageLimit);
};

/** Row with no code name and no discount value — safe to drop when skipping or saving. */
export const isBlankDiscountCodeRow = (code = {}) => {
  const codeName = String(code.code ?? "").trim();
  const value = code.value;
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(parseFloat(value));
  return !codeName && !hasValue;
};

export const filterBlankDiscountCodes = (codes = []) =>
  (Array.isArray(codes) ? codes : []).filter((code) => !isBlankDiscountCodeRow(code));

export const validateDiscountCodesList = (codes = []) => {
  const meaningfulCodes = filterBlankDiscountCodes(codes);
  if (meaningfulCodes.length === 0) {
    return true;
  }

  return meaningfulCodes.every((code) => {
    if (!code.code || code.code.trim() === "") return false;
    if (!code.type || (code.type !== "fixed" && code.type !== "percentage")) return false;
    if (
      code.value === null ||
      code.value === "" ||
      Number.isNaN(parseFloat(code.value)) ||
      parseFloat(code.value) < 0
    ) {
      return false;
    }
    if (
      code.usageLimit &&
      (Number.isNaN(parseInt(code.usageLimit, 10)) || parseInt(code.usageLimit, 10) < 0)
    ) {
      return false;
    }
    return true;
  });
};

/**
 * Prepare discount codes data for API submission
 * @param {Array} discountCodes - Array of discount code objects
 * @param {string|number} eventId - Optional event ID to override stored value
 * @returns {Object} Formatted discount codes data for API
 */
/** Map API discount code to step/form shape using organizer timezone. */
export const mapApiDiscountToStepDiscount = (code = {}, timezone) => {
  const timeZone = resolveEventTimezone(timezone);
  const validFrom = instantToLocalWallClock(code.validFrom, timeZone);
  const validUntil = instantToLocalWallClock(code.validUntil, timeZone);

  return {
    id: code.id,
    code: code.code || "",
    type: code.type || "percentage",
    value: code.value ?? "",
    usageLimit: formatUsageLimitForUI(code.usageLimit),
    validFromDate: validFrom.date,
    validFromTime: validFrom.time,
    validUntilDate: validUntil.date,
    validUntilTime: validUntil.time,
    ticketsApplicable: Array.isArray(code.ticketsApplicable)
      ? code.ticketsApplicable
          .map((id) => parseInt(id, 10))
          .filter((id) => Number.isFinite(id))
      : [],
    isActive: code.isActive !== false,
    isDeleted: code.isDeleted === true,
  };
};

/** Build discount validFrom/validUntil instants for API from form fields. */
export const buildDiscountValidityInstants = (code, timezone, eventDateTime = {}) => {
  const timeZone = resolveEventTimezone(timezone);
  const fallbackValidFrom = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const fallbackValidUntil = eventEndInstantFromFormDateTime({
    ...eventDateTime,
    timezone: timeZone,
  });

  return {
    validFrom:
      localWallClockToInstant(code.validFromDate, code.validFromTime, timeZone) ||
      fallbackValidFrom,
    validUntil:
      localWallClockToInstant(code.validUntilDate, code.validUntilTime, timeZone) ||
      fallbackValidUntil,
  };
};

export const prepareDiscountCodesDataForAPI = (
  discountCodes,
  eventId = null,
  timezone
) => {
  const userData = getUserData();
  const eventData = getEventData();
  const eventDataId = eventId || eventData?.eventId || 0;
  const eventDateTime = eventData?.dateTime || {};
  const timeZone = resolveEventTimezone(timezone || eventDateTime.timezone);

  return {
    id: parseInt(eventDataId, 10),
    discountCodes: discountCodes.map((code) => {
      const ticketsApplicable = code.ticketsApplicable.map((ticketId) =>
        parseInt(ticketId, 10)
      );
      const { validFrom, validUntil } = buildDiscountValidityInstants(
        code,
        timeZone,
        eventDateTime
      );

      return {
        id: code.id || null,
        code: code.code,
        type: code.type,
        value: parseFloat(code.value),
        validFrom,
        validUntil,
        usageLimit: parseUsageLimitForAPI(code.usageLimit),
        isActive: true,
        isDeleted: false,
        ticketsApplicable,
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

const PHYSICAL_LOCATION_FIELDS = [
  { key: "venue", label: "Venue name" },
  { key: "street", label: "Street address" },
  { key: "streetNumber", label: "Street No." },
  { key: "city", label: "City" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
];

/**
 * Merges nested `location` with flat GetEventAPI `eventLocation*` fields.
 * @param {Object} event
 * @returns {Object}
 */
export const getEffectiveEventLocation = (event = {}) => {
  const nested = event?.location || {};
  const firstString = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v);
      }
    }
    return "";
  };

  return {
    ...nested,
    locationType: firstString(
      nested.locationType,
      event.eventLocationType
    ) || "physical",
    isToBeAnnounced:
      nested.isToBeAnnounced === true || event.eventLocationType === "tba",
    venue: firstString(nested.venue, event.eventLocationName),
    street: firstString(nested.street, event.eventLocationStreet),
    streetNumber: firstString(nested.streetNumber, event.eventLocationStreetNumber),
    city: firstString(nested.city, event.eventLocationCity),
    postalCode: firstString(nested.postalCode, event.eventLocationPostalCode),
    state: firstString(nested.state, event.eventLocationState),
    country: firstString(
      nested.country,
      event.eventLocationCountry,
      event.country
    ),
  };
};

/**
 * @param {Object} event
 * @returns {'physical'|'online'|'tba'}
 */
export const getEventLocationMode = (event = {}) => {
  const location = getEffectiveEventLocation(event);
  if (location.isToBeAnnounced) {
    return "tba";
  }
  if (location.locationType === "online") {
    return "online";
  }
  return "physical";
};

/**
 * @param {Object} location
 * @returns {string[]}
 */
export const getPhysicalLocationMissingFieldLabels = (location = {}) => {
  return PHYSICAL_LOCATION_FIELDS.filter(
    ({ key }) => !String(location?.[key] ?? "").trim()
  ).map(({ label }) => label);
};

export const getOnlineLocationMissingFieldLabels = (location = {}) => {
  const url = String(location.onlineEventUrl ?? "").trim();
  return url ? [] : ["Meeting link URL"];
};

/**
 * Required fields for the current location mode (excludes optional map / hybrid links).
 * @param {Object} event
 * @returns {string[]}
 */
export const getLocationStepMissingFieldLabels = (event = {}) => {
  const mode = getEventLocationMode(event);
  const location = getEffectiveEventLocation(event);
  if (mode === "tba") {
    return [];
  }
  if (mode === "online") {
    return getOnlineLocationMissingFieldLabels(location);
  }
  return getPhysicalLocationMissingFieldLabels(location);
};

/**
 * Physical venues need venue, street, street no., city, postal code, and country.
 * Google Maps link and virtual meeting URL are optional.
 * Online events require a meeting link URL.
 * @param {Object} event
 * @returns {boolean}
 */
export const isEventLocationComplete = (event = {}) =>
  getLocationStepMissingFieldLabels(event).length === 0;

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

/**
 * Same checks as manage-event publish fallback: enough data on the event + dashboard
 * to publish without relying on wizard step flags.
 * @param {Object} event
 * @param {Object} dashboard
 * @returns {boolean}
 */
export const hasPublishableTickets = (event = {}, dashboard = {}) => {
  const ticketList = Array.isArray(event?.tickets)
    ? event.tickets
    : Array.isArray(event?.ticketStructures)
      ? event.ticketStructures
      : [];

  if (ticketList.length === 0) {
    return false;
  }

  return ticketList.some((ticket) => {
    if (!ticket || typeof ticket !== "object") {
      return false;
    }

    const isDonation = String(ticket?.ticketKind || "").toUpperCase() === "DONATION";
    const hasName = Boolean(String(ticket?.name || "").trim());
    const hasPrice =
      ticket?.price != null &&
      ticket.price !== "" &&
      !Number.isNaN(Number(ticket.price)) &&
      Number(ticket.price) >= 0;

    if (isDonation) {
      return hasName || Boolean(ticket?.id) || ticket?.ticketKind === "DONATION";
    }

    return hasName && hasPrice;
  });
};

export const isPublishReadyFromEventData = (event = {}, dashboard = {}) => {
  const hasName = Boolean(event?.name && String(event.name).trim().length > 0);
  const hasDescription = Boolean(
    event?.description && String(event.description).trim().length > 0
  );

  const startDate = event?.dateTime?.startDate || event?.startDate;
  const startTime = event?.dateTime?.startTime || event?.startTime;
  const endDate = event?.dateTime?.endDate || event?.endDate;
  const endTime = event?.dateTime?.endTime || event?.endTime;
  const hasDateTime = Boolean(startDate && startTime && endDate && endTime);

  const hasLocation = isEventLocationComplete(event);
  const hasTickets = hasPublishableTickets(event, dashboard);

  return hasName && hasDescription && hasDateTime && hasLocation && hasTickets;
};

const WIZARD_STEP_CHECKS = [
  { flag: "step1Completed", label: "Basic information" },
  { flag: "step2Completed", label: "Location" },
  { flag: "step3Completed", label: "Date and time" },
  { flag: "step4Completed", label: "Description" },
  { flag: "step5Completed", label: "Thumbnail and banner" },
  { flag: "step6Completed", label: "Tickets" },
  { flag: "step7Completed", label: "Discount codes (optional)" },
];

/**
 * Human-readable gaps for event+dashboard publish prerequisites (manage flow).
 * @param {Object} event
 * @param {Object} dashboard
 * @returns {string[]}
 */
export const getEventPublishMissingItems = (event = {}, dashboard = {}) => {
  const missing = [];

  if (!event?.name || String(event.name).trim().length === 0) {
    missing.push("Add an event name (open Event Page from the sidebar).");
  }

  if (!event?.description || String(event.description).trim().length === 0) {
    missing.push("Add an event description in the editor.");
  }

  const startDate = event?.dateTime?.startDate || event?.startDate;
  const startTime = event?.dateTime?.startTime || event?.startTime;
  const endDate = event?.dateTime?.endDate || event?.endDate;
  const endTime = event?.dateTime?.endTime || event?.endTime;
  if (!(startDate && startTime && endDate && endTime)) {
    missing.push("Set start and end date and time.");
  }

  if (!isEventLocationComplete(event)) {
    const missingFields = getLocationStepMissingFieldLabels(event);
    if (missingFields.length > 0) {
      missing.push(
        `Location — add: ${missingFields.join(", ")} (Event Page → Location).`
      );
    } else {
      missing.push("Add a location, or choose Online / To be announced.");
    }
  }

  const hasTickets = hasPublishableTickets(event, dashboard);
  if (!hasTickets) {
    missing.push("Add at least one ticket or donation under Tickets.");
  }

  return missing;
};

/**
 * Steps not yet marked complete by the API (creation wizard).
 * @param {Object|null|undefined} statusData
 * @returns {string[]}
 */
export const getIncompleteWizardStepHints = (statusData) => {
  if (!statusData) {
    return [];
  }
  return WIZARD_STEP_CHECKS.filter(({ flag }) => !statusData[flag]).map(
    ({ label }) =>
      `Finish "${label}" in the event editor (sidebar → Event Page).`
  );
};

const getDateTimeMissingFieldLabels = (event = {}) => {
  const dateTime = event?.dateTime || {};
  const startDate = dateTime.startDate || event.startDate;
  const startTime = dateTime.startTime || event.startTime;
  const endDate = dateTime.endDate || event.endDate;
  const endTime = dateTime.endTime || event.endTime;
  const timezone = resolveEventTimezone(dateTime.timezone || event.timezone || event.timeZone);
  const missing = [];
  if (!startDate) missing.push("Start date");
  if (!startTime) missing.push("Start time");
  if (!endDate) missing.push("End date");
  if (!endTime) missing.push("End time");
  if (startDate && startTime && endDate && endTime) {
    const startIso = localWallClockToInstant(startDate, startTime, timezone);
    const endIso = localWallClockToInstant(endDate, endTime, timezone);
    if (startIso && endIso && new Date(endIso) <= new Date(startIso)) {
      missing.push("End must be after start");
    }
  }
  return missing;
};

/**
 * Missing required fields per creation step (steps 1–7), for publish-step gating.
 * @param {Object} event
 * @param {Object} stepStatus
 * @returns {string[]}
 */
export const getCreationWizardPublishBlockers = (event = {}, stepStatus = {}) => {
  const blockers = [];
  const stepChecks = [
    {
      key: "basicInfo",
      label: "Basic Info",
      getMissing: () =>
        !event?.name?.trim() ? ["Event name"] : [],
    },
    {
      key: "location",
      label: "Location",
      getMissing: () => getLocationStepMissingFieldLabels(event),
    },
    {
      key: "dateTime",
      label: "Date and time",
      getMissing: () => getDateTimeMissingFieldLabels(event),
    },
    {
      key: "description",
      label: "Description",
      getMissing: () =>
        !event?.description?.trim() ? ["Event description"] : [],
    },
    {
      key: "art",
      label: "Art",
      getMissing: () => [],
    },
    {
      key: "tickets",
      label: "Tickets",
      getMissing: () => {
        const tickets = event?.tickets;
        if (!Array.isArray(tickets) || tickets.length === 0) {
          return ["At least one ticket"];
        }
        const hasInvalid = tickets.some(
          (ticket) =>
            !ticket?.name?.trim() ||
            ticket.price === null ||
            ticket.price === "" ||
            Number.isNaN(parseFloat(ticket.price)) ||
            parseFloat(ticket.price) < 0
        );
        return hasInvalid ? ["Valid ticket name and price for each ticket"] : [];
      },
    },
    {
      key: "discountCodes",
      label: "Discount codes",
      getMissing: () => [],
    },
  ];

  for (const { key, label, getMissing } of stepChecks) {
    const missing = getMissing();
    const markedComplete = Boolean(stepStatus?.[key]?.completed);
    if (missing.length > 0) {
      blockers.push(`${label}: ${missing.join(", ")}`);
    } else if (!markedComplete) {
      blockers.push(`Complete the ${label} step`);
    }
  }

  return blockers;
};

/**
 * @param {string[]} blockers
 * @returns {string}
 */
export const formatPublishBlockersAlertMessage = (blockers = []) => {
  if (!blockers.length) {
    return "Please complete all previous steps before publishing.";
  }
  return [
    "Please complete the following before publishing:",
    "",
    ...blockers.map((line) => `• ${line}`),
  ].join("\n");
};

/**
 * Manage-event publish gate: enabled only when event payload meets publish prerequisites.
 * When disabled, lists concrete blockers (including specific missing location fields).
 * @param {Object} params
 * @param {Object|null} params.statusData - GetEventStatusAPI payload
 * @param {Object|null} params.eventData
 * @param {Object|null} params.dashboardData
 * @param {boolean} params.isPublished
 * @returns {{ canPublish: boolean, blockers: string[], isPublishedLive: boolean }}
 */
export const getManagePublishGate = ({
  statusData,
  eventData,
  dashboardData,
  isPublished,
}) => {
  if (isPublished) {
    return { canPublish: false, blockers: [], isPublishedLive: true };
  }

  const eventReady = isPublishReadyFromEventData(
    eventData || {},
    dashboardData || {}
  );

  if (eventReady) {
    return { canPublish: true, blockers: [], isPublishedLive: false };
  }

  const blockers = getEventPublishMissingItems(
    eventData || {},
    dashboardData || {}
  );

  if (!statusData && blockers.length === 0) {
    blockers.push(
      "Could not load event data — refresh the page, then complete required fields."
    );
  }

  const seen = new Set();
  const unique = blockers.filter((line) => {
    if (seen.has(line)) return false;
    seen.add(line);
    return true;
  });

  return { canPublish: false, blockers: unique, isPublishedLive: false };
};