import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './steps.module.scss';

/**
 * LocationStep component - Second step of event creation
 * Collects event location information with options for TBA or manual entry
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
  
  // Local state for form management
  const [location, setLocation] = useState({
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
   * Handle checkbox changes
   * @param {Object} e Event object
   */
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    // If "To be announced" is checked, reset the form fields
    if (name === 'isToBeAnnounced' && checked) {
      setLocation(prev => ({
        ...prev,
        isToBeAnnounced: checked,
        // Keep private location setting
        searchQuery: '',
        venue: '',
        street: '',
        streetNumber: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
        additionalInfo: '',
        latitude: '',
        longitude: ''
      }));
      
      // Clear validation errors
      setErrors({});
    } else {
      setLocation(prev => ({
        ...prev,
        [name]: checked
      }));
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
    
    // Mock Google Maps API response with a timeout
    // In a real app, you would call the Google Maps API here
    setTimeout(() => {
      // Mock response - would be replaced with actual API response
      const mockResponse = {
        venue: 'Auckland Convention Centre',
        street: 'Example Street',
        streetNumber: '123',
        city: 'Auckland',
        postalCode: '1010',
        state: 'Auckland',
        country: 'New Zealand',
        latitude: '-36.848461',
        longitude: '174.763336'
      };
      
      // Update location with search results
      setLocation(prev => ({
        ...prev,
        ...mockResponse
      }));
      
      // Hide loading state
      setIsLoadingMap(false);
    }, 1000);
  };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Event Location Information</h2>
        <p className={styles.stepDescription}>List your basic event details below.</p>
      </div>
      
      <div className={styles.formSection}>
        {/* Checkbox options */}
        <div className={styles.checkboxOptions}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isToBeAnnounced"
              name="isToBeAnnounced"
              checked={location.isToBeAnnounced}
              onChange={handleCheckboxChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="isToBeAnnounced" className={styles.checkboxLabel}>
              To be announced
            </label>
          </div>
          
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isPrivateLocation"
              name="isPrivateLocation"
              checked={location.isPrivateLocation}
              onChange={handleCheckboxChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="isPrivateLocation" className={styles.checkboxLabel}>
              Private Location
            </label>
          </div>
        </div>
        
        {/* Location search and map (only shown if not TBA) */}
        {!location.isToBeAnnounced && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="searchQuery" className={styles.formLabel}>
                Search
              </label>
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  id="searchQuery"
                  name="searchQuery"
                  className={`${styles.formInput} ${errors.searchQuery ? styles.inputError : ''}`}
                  placeholder="Enter address or location name"
                  value={location.searchQuery}
                  onChange={handleFieldChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  type="button" 
                  className={styles.searchButton}
                  onClick={handleSearch}
                  disabled={isLoadingMap}
                >
                  {isLoadingMap ? 'Loading...' : 'Search'}
                </button>
              </div>
              {errors.searchQuery && (
                <div className={styles.fieldError}>{errors.searchQuery}</div>
              )}
            </div>
            
            {/* Map container - would be replaced with actual Google Maps component */}
            <div className={styles.mapContainer}>
              {isLoadingMap ? (
                <div className={styles.mapLoading}>Loading map...</div>
              ) : (
                <div className={styles.mapPlaceholder}>
                  {/* This would be replaced with an actual Google Maps component */}
                  <img 
                    src="/mock-map-auckland.png" 
                    alt="Map of Auckland"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22250%22%20viewBox%3D%220%200%20500%20250%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22500%22%20height%3D%22250%22%20fill%3D%22%23004080%22%2F%3E%3Ctext%20x%3D%22250%22%20y%3D%22125%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%23FFFFFF%22%20text-anchor%3D%22middle%22%3EGoogle%20Maps%20would%20display%20here%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                    className={styles.mapImage}
                  />
                </div>
              )}
            </div>
            
            {/* Location details form */}
            <div className={styles.formGroup}>
              <label htmlFor="venue" className={styles.formLabel}>
                Venue
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                className={`${styles.formInput} ${errors.venue ? styles.inputError : ''}`}
                placeholder="Enter venue name"
                value={location.venue}
                onChange={handleFieldChange}
              />
              {errors.venue && (
                <div className={styles.fieldError}>{errors.venue}</div>
              )}
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="street" className={styles.formLabel}>
                  Street
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  className={`${styles.formInput} ${errors.street ? styles.inputError : ''}`}
                  placeholder="Enter street name"
                  value={location.street}
                  onChange={handleFieldChange}
                />
                {errors.street && (
                  <div className={styles.fieldError}>{errors.street}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="streetNumber" className={styles.formLabel}>
                  Street No.
                </label>
                <input
                  type="text"
                  id="streetNumber"
                  name="streetNumber"
                  className={styles.formInput}
                  placeholder="Enter street number"
                  value={location.streetNumber}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city" className={styles.formLabel}>
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className={`${styles.formInput} ${errors.city ? styles.inputError : ''}`}
                  placeholder="Enter city"
                  value={location.city}
                  onChange={handleFieldChange}
                />
                {errors.city && (
                  <div className={styles.fieldError}>{errors.city}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="postalCode" className={styles.formLabel}>
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  className={styles.formInput}
                  placeholder="Enter postal code"
                  value={location.postalCode}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="state" className={styles.formLabel}>
                  State/Province
                </label>
                <div className={styles.selectWrapper}>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className={`${styles.formInput} ${errors.state ? styles.inputError : ''}`}
                    placeholder="Enter state or province"
                    value={location.state}
                    onChange={handleFieldChange}
                  />
                  <div className={styles.selectArrow}>▼</div>
                </div>
                {errors.state && (
                  <div className={styles.fieldError}>{errors.state}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.formLabel}>
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className={styles.formInput}
                  placeholder="Enter country"
                  value={location.country}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo" className={styles.formLabel}>
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                className={styles.formTextarea}
                placeholder="Provide any additional details about the location"
                value={location.additionalInfo}
                onChange={handleFieldChange}
                rows={4}
              />
            </div>
          </>
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