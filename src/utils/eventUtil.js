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
    locationType: locationData.locationType || 'public',
    eventLocationId: 0, // This would be filled in on update
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

export const prepareDateTimeDataForAPI = (dateTimeData, eventId = null, isPrivate = false) => {
  const userData = getUserData();
  const eventData = getEventData();
  
  // Use provided eventId first, or fall back to stored eventId
  const eventDataId = eventId || eventData?.eventId || 0;
  
  // Parse time values
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    return {
      hour: hours,
      minute: minutes,
      second: 0,
      nano: 0
    };
  };
  
  return {
    id: eventDataId,
    startDate: dateTimeData.startDate || '',
    startTime: parseTime(dateTimeData.startTime),
    endDate: dateTimeData.endDate || '',
    endTime: parseTime(dateTimeData.endTime),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use browser's timezone
    isPrivate: isPrivate,
    updatedBy: userData?.id || eventData?.createdBy || 0
  };
};