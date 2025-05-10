/**
 * eventUtil.js - Utilities for managing event data during creation
 */
import { getUserData } from './authUtil';

/**
 * Save event data to localStorage
 * @param {Object} eventData - Event data from API response
 */
export const saveEventData = (eventData) => {
  try {
    localStorage.setItem('currentEventData', JSON.stringify(eventData));
  } catch (error) {
    console.error('Error storing event data:', error);
  }
};

/**
 * Get current event data from localStorage
 * @returns {Object|null} Event data object or null if not found
 */
export const getEventData = () => {
  try {
    const eventData = localStorage.getItem('currentEventData');
    return eventData ? JSON.parse(eventData) : null;
  } catch (error) {
    console.error('Error retrieving event data:', error);
    return null;
  }
};

/**
 * Clear event data from localStorage
 */
export const clearEventData = () => {
  localStorage.removeItem('currentEventData');
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
    locationType: locationData.locationType || 'physical',
    eventLocationId: null, // This would be filled in on update
    venueName: locationData.venue || '',
    address: formatAddress(locationData),
    latitude: parseFloat(locationData.latitude) || 0,
    longitude: parseFloat(locationData.longitude) || 0,
    streetNo: locationData.streetNumber || '',
    street: locationData.street || '',
    city: locationData.city || '',
    state: locationData.state || '',
    country: locationData.country || '',
    postalCode: locationData.postalCode || '',
    googleMapLink: locationData.searchQuery || '',
    onlineEventUrl: '', // Not used in current implementation
    onlineEventDescription: '', // Not used in current implementation
    additionalInfo: locationData.additionalInfo || '',
    updatedBy: userData?.id || eventData?.createdBy || 0
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
  if (locationData.state) components.push(locationData.state);
  if (locationData.country) components.push(locationData.country);
  if (locationData.postalCode) components.push(locationData.postalCode);
  
  return components.join(', ');
};

export const prepareDateTimeDataForAPI = (dateTimeData, eventId = null) => {
  const userData = getUserData();
  const eventData = getEventData();
  
  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;
  
  // Format time string to ensure HH:MM:SS format
  const formatTimeString = (timeStr) => {
    if (!timeStr) return '';
    
    // If the time string already has seconds, return it
    if (timeStr.split(':').length === 3) return timeStr;
    
    // Otherwise, add :00 for seconds
    return `${timeStr}:00`;
  };
  
  return {
    id: parseInt(eventDataId, 10), // Convert to integer if it's a string
    startDate: dateTimeData.startDate || '',
    startTime: formatTimeString(dateTimeData.startTime),
    endDate: dateTimeData.endDate || '',
    endTime: formatTimeString(dateTimeData.endTime),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updatedBy: userData?.id || eventData?.createdBy || 0
  };
};

/**
 * Prepare description data for API submission
 * @param {string} description - Event description content
 * @param {string|number} eventId - Optional event ID to override stored value
 * @param {boolean} isPrivate - Whether the event is private
 * @returns {Object} Formatted description data for API
 */
export const prepareDescriptionDataForAPI = (description, eventId = null, isPrivate = false) => {
  const userData = getUserData();
  const eventData = getEventData();
  
  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;
  
  // Create a short description by removing HTML tags and limiting to 150 chars
  const createShortDescription = (htmlText) => {
    // Remove HTML tags
    const plainText = htmlText.replace(/<[^>]*>/g, '');
    // Limit to 150 characters
    return plainText.substring(0, 150);
  };
  
  return {
    id: parseInt(eventDataId, 10), // Convert to integer if it's a string
    description: description || '',
    shortDescription: createShortDescription(description || ''),
    keywords: '', // Not used in current implementation, but required by API
    isPrivate: isPrivate,
    updatedBy: userData?.id || eventData?.createdBy || 0
  };
};

/**
 * Prepare art/image data for API submission
 * @param {Object} artData - Art data containing file information
 * @param {string|number} eventId - Optional event ID to override stored value
 * @param {string} imageType - Type of image ('thumbnail' or 'banner')
 * @returns {Object} Formatted JSON data for API
 */
export const prepareArtDataForAPI = (artData, eventId = null, imageType = 'banner') => {
  const userData = getUserData();
  const eventData = getEventData();
  
  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;
  
  // The API expects a JSON object, not FormData
  return {
    id: parseInt(eventDataId, 10),
    bannerImage: artData && artData[`${imageType}Name`] ? artData[`${imageType}Name`] : '',
    updatedBy: userData?.id || eventData?.createdBy || 0
  };
};