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
 * Prepare location data for API submission
 * @param {Object} locationData - Location data from the form
 * @returns {Object} Formatted location data for API
 */
export const prepareLocationDataForAPI = (locationData) => {
  const userData = getUserData();
  const eventData = getEventData();

  return {
    id: eventData?.eventId || 0,
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
    onlineEventUrl: "", // Not used in current implementation
    onlineEventDescription: "", // Not used in current implementation
    additionalInfo: locationData.additionalInfo || "",
    updatedBy: userData?.id || eventData?.createdBy || 0,
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

  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;

  // Format time string to ensure HH:MM:SS format
  const formatTimeString = (timeStr) => {
    if (!timeStr) return "";

    // If the time string already has seconds, return it
    if (timeStr.split(":").length === 3) return timeStr;

    // Otherwise, add :00 for seconds
    return `${timeStr}:00`;
  };

  return {
    id: parseInt(eventDataId, 10), // Convert to integer if it's a string
    startDate: dateTimeData.startDate || "",
    startTime: formatTimeString(dateTimeData.startTime),
    endDate: dateTimeData.endDate || "",
    endTime: formatTimeString(dateTimeData.endTime),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        formatToISO(eventDateTime.startDate, eventDateTime.startTime);

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

  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;

  return {
    id: parseInt(eventDataId, 10),
    usesDiscountCodes: Array.isArray(discountCodes) && discountCodes.length > 0,
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