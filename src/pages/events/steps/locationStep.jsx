// src/pages/events/steps/locationStep.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { UpdateEventLocationAPI } from '../../../services/allApis';
import styles from './locationStep.module.scss';

/**
 * LocationStep component - Second step of event creation
 * Collects event location information with options for different location types
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} LocationStep component
 */
const LocationStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false }
}) => {
  // Extract location data from eventData or use defaults
  const locationData = eventData.location || {};
  
  // Map references
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  
  // Local state for form management
  const [location, setLocation] = useState({
    locationType: locationData.locationType || 'public',
    isToBeAnnounced: locationData.isToBeAnnounced || false,
    isPrivateLocation: locationData.isPrivateLocation || false,
    searchQuery: locationData.searchQuery || '',
    venue: locationData.venue || '',
    street: locationData.street || '',
    streetNumber: locationData.streetNumber || '',
    city: locationData.city || '',
    postalCode: locationData.postalCode || '',
    state: locationData.state || '',
    country: locationData.country || '',
    additionalInfo: locationData.additionalInfo || '',
    latitude: locationData.latitude || '',
    longitude: locationData.longitude || ''
  });
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // State for map visibility and loading
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'satellite'

  // API-related state
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  /**
   * Initialize Google Maps
   */
  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBAp9QrQIKe6JRxSiF5xV4HPMIym8GBi_0&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeMap();
    }
  }, []);
  
  /**
   * Initialize the Google Map
   */
  const initializeMap = () => {
    if (!mapRef.current) return;
    
    // Default to Australia if no coordinates are provided
    const defaultPosition = { lat: -25.2744, lng: 133.7751 };
    const position = location.latitude && location.longitude
      ? { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }
      : defaultPosition;
      
    const mapOptions = {
      center: position,
      zoom: 4,
      mapTypeId: activeTab === 'map' ? 'roadmap' : 'satellite',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    };
    
    // Create the map
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current = map;
    
    // Create a marker if location is set
    if (location.latitude && location.longitude) {
      new window.google.maps.Marker({
        position,
        map,
        title: location.venue || 'Selected Location'
      });
    }
  };
  
  /**
   * Switch map type (map or satellite)
   * @param {string} type - 'map' or 'satellite'
   */
  const switchMapType = (type) => {
    setActiveTab(type);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(type === 'map' ? 'roadmap' : 'satellite');
    }
  };
  
  /**
   * Validate the location form
   * @returns {boolean} Is the form valid
   */
  const validateForm = () => {
    // If "To be announced" is checked, form is valid
    if (location.isToBeAnnounced) {
      return true;
    }
    
    const newErrors = {};
    
    // Required fields validation
    if (!location.venue) newErrors.venue = 'Venue is required';
    if (!location.street) newErrors.street = 'Street is required';
    if (!location.city) newErrors.city = 'City is required';
    if (!location.state) newErrors.state = 'State/Province is required';
    
    // Update errors state
    setErrors(newErrors);
    
    // Form is valid if there are no errors
    return Object.keys(newErrors).length === 0;
  };
  
  // Effect to propagate location changes to parent component
  useEffect(() => {
    // Send the updated location data to parent component
    handleInputChange({ location }, 'location');
  }, [location, handleInputChange]);
  
  // Update parent component about form validity
  useEffect(() => {
    // Tell parent component if form is valid when step is visited
    if (stepStatus.visited && handleInputChange) {
      const isFormValid = validateForm();
      handleInputChange(isFormValid, 'locationValid');
    }
  }, [location, stepStatus, handleInputChange]);
  
  /**
   * Handle location type selection (public, private, to be announced)
   * @param {string} type - Location type
   */
  const handleLocationTypeChange = (type) => {
    let updatedLocation = { ...location, locationType: type };
    
    // Update isToBeAnnounced flag based on type
    if (type === 'tba') {
      updatedLocation.isToBeAnnounced = true;
    } else {
      updatedLocation.isToBeAnnounced = false;
      updatedLocation.isPrivateLocation = type === 'private';
    }
    
    setLocation(updatedLocation);
    
    // Clear validation errors if switching to TBA
    if (type === 'tba') {
      setErrors({});
    }
  };
  
  /**
   * Handle input changes
   * @param {Object} e Event object
   */
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for the field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  /**
   * Handle search query submission
   */
  const handleSearch = () => {
    if (!location.searchQuery) {
      setErrors(prev => ({
        ...prev,
        searchQuery: 'Please enter a location to search'
      }));
      return;
    }
    
    // Clear the error
    setErrors(prev => ({
      ...prev,
      searchQuery: ''
    }));
    
    // Show loading state
    setIsLoadingMap(true);
    
    // Use Google Maps Geocoding API to search for location
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: location.searchQuery }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const result = results[0];
          const position = result.geometry.location;
          
          // Extract address components
          let updatedLocation = {
            ...location,
            latitude: position.lat(),
            longitude: position.lng()
          };
          
          // Process address components
          for (const component of result.address_components) {
            const types = component.types;
            
            if (types.includes('street_number')) {
              updatedLocation.streetNumber = component.long_name;
            } else if (types.includes('route')) {
              updatedLocation.street = component.long_name;
            } else if (types.includes('locality')) {
              updatedLocation.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              updatedLocation.state = component.long_name;
            } else if (types.includes('country')) {
              updatedLocation.country = component.long_name;
            } else if (types.includes('postal_code')) {
              updatedLocation.postalCode = component.long_name;
            }
          }
          
          // Update venue if not set
          if (!updatedLocation.venue) {
            updatedLocation.venue = result.formatted_address.split(',')[0];
          }
          
          // Update location state
          setLocation(updatedLocation);
          
          // Update map
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(position);
            googleMapRef.current.setZoom(15);
            
            // Add marker
            new window.google.maps.Marker({
              position,
              map: googleMapRef.current,
              title: updatedLocation.venue || 'Selected Location'
            });
          }
        } else {
          setErrors(prev => ({
            ...prev,
            searchQuery: 'Location not found. Please try a different search.'
          }));
        }
        
        setIsLoadingMap(false);
      });
    } else {
      // Fallback if Google Maps API is not available
      setTimeout(() => {
        // Mock response - would be replaced with actual API response
        const mockResponse = {
          venue: 'Sydney Convention Centre',
          street: 'Example Street',
          streetNumber: '123',
          city: 'Sydney',
          postalCode: '2000',
          state: 'New South Wales',
          country: 'Australia',
          latitude: '-33.865143',
          longitude: '151.209900'
        };
        
        // Update location with search results
        setLocation(prev => ({
          ...prev,
          ...mockResponse
        }));
        
        setIsLoadingMap(false);
      }, 1000);
    }
  };

  /**
   * Save location data to API
   * This function can be used for auto-save functionality
   * @param {string} eventId - Event ID
   * @param {Object} userData - Current user data for updatedBy field
   */
  const saveLocationData = async (eventId, userData) => {
    if (!validateForm() || !eventId) return;
    
    setIsSaving(true);
    setApiError(null);
    
    try {
      // Format location data for API
      const locationApiData = {
        id: eventId,
        locationType: location.isPrivateLocation ? 'private' : 'public',
        eventLocationId: 0, // Default value since not available in form
        venueName: location.isToBeAnnounced ? '' : location.venue,
        address: location.isToBeAnnounced ? 'To be announced' : 
          `${location.street}, ${location.city}, ${location.state}`,
        latitude: parseFloat(location.latitude || 0),
        longitude: parseFloat(location.longitude || 0),
        streetNo: location.streetNumber,
        street: location.street,
        city: location.city,
        state: location.state,
        country: location.country,
        postalCode: location.postalCode,
        googleMapLink: "", // Not available in form
        onlineEventUrl: "", // Not available in form
        onlineEventDescription: "", // Not available in form
        additionalInfo: location.additionalInfo,
        updatedBy: userData?.id || 0
      };
      
      await UpdateEventLocationAPI(eventId, locationApiData);
      
      // Success handling could be added here
    } catch (error) {
      console.error('Error saving location data:', error);
      setApiError('Failed to save location information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className={styles.stepContainer}>
      {apiError && (
        <div className={styles.errorAlert}>
          {apiError}
          <button 
            className={styles.dismissButton}
            onClick={() => setApiError(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.formSection}>
        {/* Location Type Section */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Location Type
          </label>
          <p className={styles.formDescription}>
            Choose how your event will appear to potential attendees
          </p>
          
          <div className={styles.locationOptions}>
            <div 
              className={`${styles.locationOption} ${location.locationType === 'public' && !location.isToBeAnnounced ? styles.selected : ''}`}
              onClick={() => !isSaving && handleLocationTypeChange('public')}
            >
              <div className={styles.locationIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill={location.locationType === 'public' && !location.isToBeAnnounced ? "#7C3AED" : "#666666"}/>
                </svg>
              </div>
              <div className={styles.locationContent}>
                <h3 className={styles.locationTitle}>Public Location</h3>
                <p className={styles.locationDescription}>
                  The location will be visible to everyone and shown on the event page
                </p>
              </div>
              <div className={styles.locationSelector}>
                {location.locationType === 'public' && !location.isToBeAnnounced && (
                  <div className={styles.selectedDot}></div>
                )}
              </div>
            </div>
            
            <div 
              className={`${styles.locationOption} ${location.locationType === 'private' ? styles.selected : ''}`}
              onClick={() => !isSaving && handleLocationTypeChange('private')}
            >
              <div className={styles.locationIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill={location.locationType === 'private' ? "#7C3AED" : "#666666"}/>
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8Z" fill={location.locationType === 'private' ? "#7C3AED" : "#666666"} fillOpacity="0.2"/>
                </svg>
              </div>
              <div className={styles.locationContent}>
                <h3 className={styles.locationTitle}>Private Location</h3>
                <p className={styles.locationDescription}>
                  Location details will only be shown to confirmed attendees
                </p>
              </div>
              <div className={styles.locationSelector}>
                {location.locationType === 'private' && (
                  <div className={styles.selectedDot}></div>
                )}
              </div>
            </div>
            
            <div 
              className={`${styles.locationOption} ${location.isToBeAnnounced ? styles.selected : ''}`}
              onClick={() => !isSaving && handleLocationTypeChange('tba')}
            >
              <div className={styles.locationIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill={location.isToBeAnnounced ? "#7C3AED" : "#666666"}/>
                  <path d="M7 12H9V17H7V12ZM15 7H17V17H15V7ZM11 14H13V17H11V14ZM11 10H13V12H11V10Z" fill={location.isToBeAnnounced ? "#7C3AED" : "#666666"}/>
                </svg>
              </div>
              <div className={styles.locationContent}>
                <h3 className={styles.locationTitle}>To be announced</h3>
                <p className={styles.locationDescription}>
                  "Location to be announced" will be shown until you update it later
                </p>
              </div>
              <div className={styles.locationSelector}>
                {location.isToBeAnnounced && (
                  <div className={styles.selectedDot}></div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Details Section - Only show if not TBA */}
        {!location.isToBeAnnounced && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Location Details
            </label>
            <p className={styles.formDescription}>
              The exact location to showcase on your event page and calendar events
            </p>
            
            {/* Search Field */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                name="searchQuery"
                className={`${styles.searchInput} ${errors.searchQuery ? styles.inputError : ''}`}
                placeholder="Search for a location (e.g., venue name, address, city)"
                value={location.searchQuery}
                onChange={handleFieldChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSaving}
              />
              <button 
                type="button" 
                className={styles.searchButton}
                onClick={handleSearch}
                disabled={isLoadingMap || isSaving}
              >
                {isLoadingMap ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#7C3AED"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.searchQuery && (
              <div className={styles.fieldError}>{errors.searchQuery}</div>
            )}
            
            {/* Map Container */}
            <div className={styles.mapContainerWithControls}>
              <div className={styles.mapTabControls}>
                <button 
                  type="button" 
                  className={`${styles.mapTabButton} ${activeTab === 'map' ? styles.activeTab : ''}`}
                  onClick={() => switchMapType('map')}
                  disabled={isSaving}
                >
                  Map
                </button>
                <button 
                  type="button" 
                  className={`${styles.mapTabButton} ${activeTab === 'satellite' ? styles.activeTab : ''}`}
                  onClick={() => switchMapType('satellite')}
                  disabled={isSaving}
                >
                  Satellite
                </button>
              </div>
              
              <div className={styles.mapContainer}>
                {isLoadingMap ? (
                  <div className={styles.mapLoading}>Loading map...</div>
                ) : (
                  <div 
                    ref={mapRef}
                    className={styles.googleMap}
                  />
                )}
              </div>
            </div>
            
            {/* Location Form Fields */}
            {/* Venue */}
            <div className={styles.formGroup}>
              <label htmlFor="venue" className={styles.formLabel}>
                Venue
              </label>
              <div className={styles.dropdownInput}>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  className={`${styles.formInput} ${errors.venue ? styles.inputError : ''}`}
                  placeholder="Enter venue name (e.g., Conference Center, Stadium)"
                  value={location.venue}
                  onChange={handleFieldChange}
                  disabled={isSaving}
                />
                <div className={styles.dropdownArrow}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                  </svg>
                </div>
              </div>
              {errors.venue && (
                <div className={styles.fieldError}>{errors.venue}</div>
              )}
            </div>
            
            {/* Street & Street No */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="street" className={styles.formLabel}>
                  Street
                </label>
                <div className={styles.dropdownInput}>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    className={`${styles.formInput} ${errors.street ? styles.inputError : ''}`}
                    placeholder="Enter street name"
                    value={location.street}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
                {errors.street && (
                  <div className={styles.fieldError}>{errors.street}</div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="streetNumber" className={styles.formLabel}>
                  Street No.
                </label>
                <div className={styles.dropdownInput}>
                  <input
                    type="text"
                    id="streetNumber"
                    name="streetNumber"
                    className={styles.formInput}
                    placeholder="Street number"
                    value={location.streetNumber}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* City & Postal Code */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city" className={styles.formLabel}>
                  City
                </label>
                <div className={styles.dropdownInput}>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`${styles.formInput} ${errors.city ? styles.inputError : ''}`}
                    placeholder="Enter city"
                    value={location.city}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
                {errors.city && (
                  <div className={styles.fieldError}>{errors.city}</div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="postalCode" className={styles.formLabel}>
                  Postal Code
                </label>
                <div className={styles.dropdownInput}>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    className={styles.formInput}
                    placeholder="Enter postal/zip code"
                    value={location.postalCode}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* State & Country */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="state" className={styles.formLabel}>
                  State/Province
                </label>
                <div className={styles.dropdownInput}>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className={`${styles.formInput} ${errors.state ? styles.inputError : ''}`}
                    placeholder="Enter state or province"
                    value={location.state}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
                {errors.state && (
                  <div className={styles.fieldError}>{errors.state}</div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.formLabel}>
                  Country
                </label>
                <div className={styles.dropdownInput}>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className={styles.formInput}
                    placeholder="Enter country"
                    value={location.country}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo" className={styles.formLabel}>
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                className={styles.formTextarea}
                placeholder="Additional details about the location (e.g., parking instructions, entrance information)"
                value={location.additionalInfo}
                onChange={handleFieldChange}
                rows={4}
                disabled={isSaving}
              />
            </div>

            {/* Coordinates */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="latitude" className={styles.formLabel}>
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  className={styles.formInput}
                  value={location.latitude}
                  onChange={handleFieldChange}
                  disabled={true} // Readonly, set by map
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="longitude" className={styles.formLabel}>
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  className={styles.formInput}
                  value={location.longitude}
                  onChange={handleFieldChange}
                  disabled={true} // Readonly, set by map
                />
              </div>
            </div>
          </div>
        )}

        {/* API response message */}
        {isSaving && (
          <div className={styles.savingIndicator}>
            <span className={styles.spinner}></span>
            Saving location data...
          </div>
        )}

        {/* Location Tips */}
        <div className={styles.locationTips}>
          <h3 className={styles.tipTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#7C3AED"/>
            </svg>
            Location Tips
          </h3>
          <ul className={styles.tipsList}>
            <li>Use the search bar to quickly find and populate location details</li>
            <li>Make sure the address is accurate to help attendees find your event</li>
            <li>Add additional information like parking details or entrance instructions</li>
            <li>For online events, you can add the link in a later step</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

LocationStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default LocationStep;