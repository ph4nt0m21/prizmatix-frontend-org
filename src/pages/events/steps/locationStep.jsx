import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './locationStep.module.scss';

/**
 * LocationStep component - Second step of event creation
 * Focused on Google Maps link pasting functionality
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
    locationType: locationData.locationType || 'physical',
    isToBeAnnounced: locationData.isToBeAnnounced || false,
    isPrivateLocation: locationData.isPrivateLocation || false,
    googleMapLink: locationData.googleMapLink || '',
    venue: locationData.venue || '',
    street: locationData.street || '',
    streetNumber: locationData.streetNumber || '',
    city: locationData.city || '',
    postalCode: locationData.postalCode || '',
    state: locationData.state || '',
    country: locationData.country || '',
    additionalInfo: locationData.additionalInfo || '',
    latitude: locationData.latitude || '',
    longitude: locationData.longitude || '',
    formattedAddress: locationData.formattedAddress || ''
  });
  
  // State for map UI
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'satellite'
  
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
      script.onerror = () => {
        console.error('Google Maps API failed to load');
        alert('Could not load Google Maps. Please check your internet connection and try again.');
      };
      document.head.appendChild(script);
      
      return () => {
        // Clean up if component unmounts before script loads
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
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
    
    // Default to Australia as shown in your design image
    const defaultPosition = { lat: -25.2744, lng: 133.7751 }; // Center of Australia
    const position = location.latitude && location.longitude
      ? { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }
      : defaultPosition;
      
    const mapOptions = {
      center: position,
      zoom: 4, // Zoom out for Australia view
      mapTypeId: activeTab === 'map' ? 'roadmap' : 'satellite',
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative'
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
   * Format address from location components
   * @param {Object} locationData - Location data
   * @returns {string} Formatted address
   */
  const formatAddress = (locationData) => {
    const components = [];
    
    if (locationData.venue) components.push(locationData.venue);
    if (locationData.streetNumber) components.push(locationData.streetNumber);
    if (locationData.street) components.push(locationData.street);
    if (locationData.city) components.push(locationData.city);
    if (locationData.state) components.push(locationData.state);
    if (locationData.country) components.push(locationData.country);
    if (locationData.postalCode) components.push(locationData.postalCode);
    
    return components.join(', ');
  };

  /**
   * Parse a Google Maps URL to extract coordinates
   * @param {string} url - Google Maps URL
   * @returns {Object|null} - Latitude and longitude if found, null otherwise
   */
  const parseGoogleMapsUrl = (url) => {
    try {
      console.log('Attempting to parse Google Maps URL:', url);
      
      // Format: https://www.google.com/maps?q=-41.2865,174.7762
      let match = url.match(/maps\?q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        const coords = {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
        console.log('Coordinates extracted from ?q= parameter:', coords);
        return coords;
      }
      
      // Format: https://www.google.com/maps/place/.../@-41.2865,174.7762,15z
      match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        const coords = {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
        console.log('Coordinates extracted from @ parameter:', coords);
        return coords;
      }
      
      console.log('No coordinates found in URL, will use geocoding instead');
      return null;
    } catch (error) {
      console.error('Error parsing Google Maps URL:', error);
      return null;
    }
  };

  /**
   * Process geocoding result and extract address components
   */
  const processGeocodingResult = (result, position) => {
    // Extract address components
    let updatedLocation = {
      ...location,
      latitude: position.lat(),
      longitude: position.lng(),
      googleMapLink: result.formatted_address
    };
    
    console.log('Processing geocoding result:');
    console.log('Latitude:', position.lat());
    console.log('Longitude:', position.lng());
    console.log('Formatted address:', result.formatted_address);
    
    // Process address components
    for (const component of result.address_components) {
      const types = component.types;
      
      if (types.includes('street_number')) {
        updatedLocation.streetNumber = component.long_name;
        console.log('Street Number:', component.long_name);
      } else if (types.includes('route')) {
        updatedLocation.street = component.long_name;
        console.log('Street:', component.long_name);
      } else if (types.includes('locality')) {
        updatedLocation.city = component.long_name;
        console.log('City:', component.long_name);
      } else if (types.includes('administrative_area_level_1')) {
        updatedLocation.state = component.long_name;
        console.log('State/Province:', component.long_name);
      } else if (types.includes('country')) {
        updatedLocation.country = component.long_name;
        console.log('Country:', component.long_name);
      } else if (types.includes('postal_code')) {
        updatedLocation.postalCode = component.long_name;
        console.log('Postal Code:', component.long_name);
      }
    }
    
    // Try to determine the venue name
    const pointOfInterest = result.address_components.find(comp => 
      comp.types.includes('point_of_interest') || 
      comp.types.includes('establishment')
    );
    
    if (pointOfInterest) {
      updatedLocation.venue = pointOfInterest.long_name;
      console.log('Venue (from POI):', pointOfInterest.long_name);
    } else {
      // Default to first line of formatted address
      updatedLocation.venue = result.formatted_address.split(',')[0];
      console.log('Venue (from first part of address):', updatedLocation.venue);
    }
    
    // Create formatted address string
    updatedLocation.formattedAddress = formatAddress(updatedLocation);
    console.log('Final formatted address string:', updatedLocation.formattedAddress);
    
    // Log the complete location object
    console.log('Final location object:', updatedLocation);
    
    // Update location state
    setLocation(updatedLocation);
    setIsLoadingMap(false);
  };

  /**
   * Handle Google Maps link pasting
   * @param {Event} e - Paste event
   */
  const handlePasteMapLink = (e) => {
    // Get pasted text
    const pastedText = e.clipboardData.getData('text');
    
    console.log('Pasted text:', pastedText);
    
    // Check if it looks like a Google Maps link
    if (pastedText.includes('google.com/maps') || pastedText.includes('goo.gl/maps')) {
      e.preventDefault(); // Prevent default paste behavior
      
      console.log('Google Maps link detected');
      
      // Set the search query to the pasted link
      setLocation(prev => ({
        ...prev,
        googleMapLink: pastedText
      }));
      
      // Show loading state
      setIsLoadingMap(true);
      
      // Parse the URL to get coordinates
      const coordinates = parseGoogleMapsUrl(pastedText);
      console.log('Extracted coordinates from URL:', coordinates);
      
      // If we have coordinates from the URL
      if (coordinates) {
        console.log('Using coordinates directly from URL:', coordinates);
        
        // Update map with the coordinates
        if (googleMapRef.current) {
          // Clear any existing markers
          googleMapRef.current.setCenter(coordinates);
          googleMapRef.current.setZoom(15);
          
          // Add marker
          new window.google.maps.Marker({
            position: coordinates,
            map: googleMapRef.current,
            title: 'Selected Location',
          });
        }
        
        // Get address details using reverse geocoding
        if (window.google && window.google.maps) {
          console.log('Starting reverse geocoding with coordinates:', coordinates);
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coordinates }, (results, status) => {
            if (status === 'OK' && results[0]) {
              console.log('Reverse geocoding successful, result:', results[0]);
              
              // Log formatted address 
              console.log('Formatted address:', results[0].formatted_address);
              
              // Log address components in detail
              console.log('Address components:');
              results[0].address_components.forEach(component => {
                console.log(`${component.types.join(', ')}: ${component.long_name}`);
              });
              
              processGeocodingResult(results[0], new window.google.maps.LatLng(coordinates.lat, coordinates.lng));
            } else {
              console.error('Reverse geocoding failed:', status);
              setIsLoadingMap(false);
            }
          });
        }
      } else {
        // If no coordinates in URL, try geocoding the entire URL
        console.log('No coordinates in URL, attempting to geocode the entire URL');
        
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: pastedText }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const result = results[0];
              const position = result.geometry.location;
              
              console.log('Geocoding successful, result:', result);
              console.log('Location:', { 
                lat: position.lat(), 
                lng: position.lng(), 
                address: result.formatted_address 
              });
              
              // Log address components in detail
              console.log('Address components:');
              result.address_components.forEach(component => {
                console.log(`${component.types.join(', ')}: ${component.long_name}`);
              });
              
              // Update map
              if (googleMapRef.current) {
                googleMapRef.current.setCenter(position);
                googleMapRef.current.setZoom(15);
                
                // Add marker
                new window.google.maps.Marker({
                  position,
                  map: googleMapRef.current,
                  title: 'Selected Location',
                });
              }
              
              // Process the result
              processGeocodingResult(result, position);
            } else {
              console.error('Geocoding failed:', status);
              alert('Could not process the Google Maps link. Please try a different link format.');
              setIsLoadingMap(false);
            }
          });
        } else {
          console.error('Google Maps API not available');
          setIsLoadingMap(false);
        }
      }
    }
  };
  
  /**
   * Switch map type (map or satellite)
   */
  const switchMapType = (type) => {
    setActiveTab(type);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(type === 'map' ? 'roadmap' : 'satellite');
    }
  };
  
  // Effect to propagate location changes to parent component
  useEffect(() => {
    // Send the updated location data to parent component
    handleInputChange(location, 'location');
  }, [location, handleInputChange]);
  
  /**
   * Handle location type selection
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
  };
  
  /**
   * Handle input changes
   */
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#7C3AED"/>
          </svg>
        </div>
        <h2 className={styles.stepTitle}>Event Location</h2>
      </div>

      <div className={styles.formSection}>
        {/* Location Type Section */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Location Type
          </label>
          <p className={styles.formDescription}>
            Choose how your event location will appear to potential attendees
          </p>
          
          <div className={styles.locationOptions}>
            <div 
              className={`${styles.locationOption} ${location.locationType === 'physical' && !location.isToBeAnnounced ? styles.selected : ''}`}
              onClick={() => handleLocationTypeChange('physical')}
            >
              <div className={styles.locationIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill={location.locationType === 'physical' && !location.isToBeAnnounced ? "#7C3AED" : "#666666"}/>
                </svg>
              </div>
              <div className={styles.locationContent}>
                <h3 className={styles.locationTitle}>Public Location</h3>
                <p className={styles.locationDescription}>
                  The location will be visible to everyone and shown on the event page
                </p>
              </div>
              <div className={styles.locationSelector}>
                {location.locationType === 'physical' && !location.isToBeAnnounced && (
                  <div className={styles.selectedDot}></div>
                )}
              </div>
            </div>
            
            <div 
              className={`${styles.locationOption} ${location.locationType === 'private' ? styles.selected : ''}`}
              onClick={() => handleLocationTypeChange('private')}
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
              onClick={() => handleLocationTypeChange('tba')}
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
            
            {/* Google Maps Link Field */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                name="googleMapLink"
                className={styles.searchInput}
                placeholder="Paste Google Maps link here"
                value={location.googleMapLink}
                onChange={handleFieldChange}
                onPaste={handlePasteMapLink}
              />
              <div className={styles.searchButton}>
                {isLoadingMap ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#7C3AED"/>
                  </svg>
                )}
              </div>
            </div>
            
            {/* Map Container */}
            <div className={styles.mapContainerWithControls}>
              <div className={styles.mapTabControls}>
                <button 
                  type="button" 
                  className={`${styles.mapTabButton} ${activeTab === 'map' ? styles.activeTab : ''}`}
                  onClick={() => switchMapType('map')}
                >
                  Map
                </button>
                <button 
                  type="button" 
                  className={`${styles.mapTabButton} ${activeTab === 'satellite' ? styles.activeTab : ''}`}
                  onClick={() => switchMapType('satellite')}
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
                  className={styles.formInput}
                  placeholder="Enter venue name (e.g., Conference Center, Stadium)"
                  value={location.venue}
                  onChange={handleFieldChange}
                />
                <div className={styles.dropdownArrow}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                  </svg>
                </div>
              </div>
              {stepStatus.visited && !location.venue && (
                <div className={styles.fieldError}>Venue is required</div>
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
                    className={styles.formInput}
                    placeholder="Enter street name"
                    value={location.street}
                    onChange={handleFieldChange}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
                {stepStatus.visited && !location.street && (
                  <div className={styles.fieldError}>Street is required</div>
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
                    className={styles.formInput}
                    placeholder="Enter city"
                    value={location.city}
                    onChange={handleFieldChange}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
                {stepStatus.visited && !location.city && (
                  <div className={styles.fieldError}>City is required</div>
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
                    className={styles.formInput}
                    placeholder="Enter state or province"
                    value={location.state}
                    onChange={handleFieldChange}
                  />
                  <div className={styles.dropdownArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10H7Z" fill="#666666"/>
                    </svg>
                  </div>
                </div>
                {stepStatus.visited && !location.state && (
                  <div className={styles.fieldError}>State/Province is required</div>
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
              />
            </div>
          </div>
        )}
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