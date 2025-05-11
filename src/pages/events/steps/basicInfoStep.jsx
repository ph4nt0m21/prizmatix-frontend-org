import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserData } from '../../../utils/authUtil';
import styles from './basicInfoStep.module.scss';

/**
 * BasicInfoStep component - First step of event creation
 * Collects basic event information like name and visibility settings
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} BasicInfoStep component
 */
const BasicInfoStep = ({ eventData, handleInputChange, isValid, stepStatus }) => {
  // State for managing search tags
  const [searchTags, setSearchTags] = useState(eventData.searchTags || []);
  const [tagInput, setTagInput] = useState('');
  
  // State for user data and modal
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const userInfo = getUserData();
    if (userInfo) {
      setUserData(userInfo);
    }
  }, []);

  /**
   * Toggle the user info modal
   */
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  /**
   * Handle visibility options selection
   * @param {string} visibilityType - Type of visibility (public or private)
   */
  const handleVisibilityChange = (visibilityType) => {
    handleInputChange(visibilityType, 'eventType');
  };
  
  /**
   * Handle checkbox changes
   * @param {Object} e Event object
   */
  const handleCheckboxChange = (e) => {
    handleInputChange(e);
  };

  /**
   * Handle category selection
   * @param {Object} e Event object
   */
  const handleCategoryChange = (e) => {
    handleInputChange(e.target.value, 'category');
  };

  /**
   * Add a new search tag
   * @param {string} tag - Tag to add
   */
  const addTag = (tag) => {
    if (tag && !searchTags.includes(tag)) {
      const newTags = [...searchTags, tag];
      setSearchTags(newTags);
      handleInputChange(newTags, 'searchTags');
      setTagInput('');
    }
  };

  /**
   * Remove a search tag
   * @param {string} tagToRemove - Tag to remove
   */
  const removeTag = (tagToRemove) => {
    const newTags = searchTags.filter(tag => tag !== tagToRemove);
    setSearchTags(newTags);
    handleInputChange(newTags, 'searchTags');
  };

  /**
   * Handle tag input change
   * @param {Object} e Event object
   */
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  /**
   * Handle tag input keydown events
   * @param {Object} e Event object
   */
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7C3AED"/>
            <path d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" fill="#7C3AED"/>
            <path d="M12 7C10.9 7 10 7.9 10 9H12C12 8.45 12.45 8 13 8C13.55 8 14 8.45 14 9C14 10 12 9.75 12 12H14C14 10.75 16 10.5 16 9C16 7.9 15.1 7 14 7H12Z" fill="#7C3AED"/>
          </svg>
        </div>
        <h2 className={styles.stepTitle}>Event Basic Information</h2>
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.formLabel}>
            Event Name
          </label>
          <p className={styles.formDescription}>
            Enter the official name of your event that will be displayed to attendees
          </p>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.formInput}
            placeholder="NORR Festival 2022"
            value={eventData.name}
            onChange={handleInputChange}
          />
          {!eventData.name && stepStatus.visited && (
            <div className={styles.fieldError}>Event name is required</div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Visibility Settings
          </label>
          <p className={styles.formDescription}>
            Choose how your event will appear to potential attendees
          </p>
          
          <div className={styles.visibilityOptions}>
            <div 
              className={`${styles.visibilityOption} ${eventData.eventType === 'public' ? styles.selected : ''}`}
              onClick={() => handleVisibilityChange('public')}
            >
              <div className={styles.visibilityIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#7C3AED"/>
                </svg>
              </div>
              <div className={styles.visibilityContent}>
                <h3 className={styles.visibilityTitle}>Public Event</h3>
                <p className={styles.visibilityDescription}>
                  Choose how your event will appear to potential attendees
                </p>
              </div>
              <div className={styles.visibilitySelector}>
                {eventData.eventType === 'public' && (
                  <div className={styles.selectedDot}></div>
                )}
              </div>
            </div>
            
            <div 
              className={`${styles.visibilityOption} ${eventData.eventType === 'private' ? styles.selected : ''}`}
              onClick={() => handleVisibilityChange('private')}
            >
              <div className={styles.visibilityIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#666666"/>
                </svg>
              </div>
              <div className={styles.visibilityContent}>
                <h3 className={styles.visibilityTitle}>Private Event</h3>
                <p className={styles.visibilityDescription}>
                  Choose how your event will appear to potential attendees
                </p>
              </div>
              <div className={styles.visibilitySelector}>
                {eventData.eventType === 'private' && (
                  <div className={styles.selectedDot}></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.formLabel}>
            Category
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="category"
              name="category"
              className={styles.formSelect}
              value={eventData.category || ''}
              onChange={handleCategoryChange}
            >
              <option value="" disabled>Select a category</option>
              <option value="EDM/Electronic">EDM/Electronic</option>
              <option value="Music">Music</option>
              <option value="Festival">Festival</option>
              <option value="Concert">Concert</option>
              <option value="Live">Live</option>
              <option value="Sports">Sports</option>
              <option value="Arts">Arts</option>
              <option value="Food & Drink">Food & Drink</option>
            </select>
            <div className={styles.selectArrow}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10H7Z" fill="#666"/>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="searchTags" className={styles.formLabel}>
            Search Tags
          </label>
          <p className={styles.formDescription}>
            Promote your event with fun tags that match its theme, topic, vibe, and location!
          </p>
          <div className={styles.tagContainer}>
            {searchTags.map((tag, index) => (
              <div key={index} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              id="searchTags"
              className={styles.tagInput}
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="Add Search keyword to your events"
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Host Profile
          </label>
          <p className={styles.formDescription}>
            Information about the event organizer that will be shown to attendees
          </p>
          
          <div className={styles.hostProfileSection}>
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="showHostProfile"
                name="showHostProfile"
                checked={eventData.showHostProfile}
                onChange={handleCheckboxChange}
                className={styles.checkboxInput}
              />
              <label htmlFor="showHostProfile" className={styles.checkboxLabel}>
                Display host information on the ticket page
              </label>
            </div>
            
            {/* Only show the host info card when showHostProfile is true */}
            {eventData.showHostProfile && (
              <div 
                className={styles.hostInfoCard}
                onClick={toggleModal}
                role="button"
                tabIndex={0}
                aria-label="View host details"
              >
                <div className={styles.hostLogo}>
                  <img src="/icons/organizer-logo.svg" alt="Organizer Logo" />
                </div>
                <div className={styles.hostDetails}>
                  <h4 className={styles.hostName}>{userData?.organizationName || 'City Music Festival Ltd.'}</h4>
                  <p className={styles.hostStats}>Events Conducted</p>
                </div>
                <button 
                  className={styles.hostOptionsButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    toggleModal();
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#666666"/>
                  </svg>
                </button>
              </div>
            )}

            {/* User Info Modal */}
            {showModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h3>Organizer Information</h3>
                    <button 
                      className={styles.closeButton}
                      onClick={toggleModal}
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.modalContent}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Name:</span>
                      <span className={styles.infoValue}>{userData?.name || 'Not available'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Organization:</span>
                      <span className={styles.infoValue}>{userData?.organizationName || 'Not available'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Email:</span>
                      <span className={styles.infoValue}>{userData?.email || 'Not available'}</span>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button 
                      className={styles.modalButton}
                      onClick={toggleModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BasicInfoStep.propTypes = {
  eventData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  stepStatus: PropTypes.object.isRequired
};

export default BasicInfoStep;