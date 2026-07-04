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
  // const [searchTags, setSearchTags] = useState(eventData.searchTags || []);
  // const [tagInput, setTagInput] = useState('');
  
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
  // const handleCategoryChange = (e) => {
  //   handleInputChange(e.target.value, 'category');
  // };

  /**
   * Add a new search tag
   * @param {string} tag - Tag to add
   */
  // const addTag = (tag) => {
  //   if (tag && !searchTags.includes(tag)) {
  //     const newTags = [...searchTags, tag];
  //     setSearchTags(newTags);
  //     handleInputChange(newTags, 'searchTags');
  //     setTagInput('');
  //   }
  // };

  /**
   * Remove a search tag
   * @param {string} tagToRemove - Tag to remove
   */
  // const removeTag = (tagToRemove) => {
  //   const newTags = searchTags.filter(tag => tag !== tagToRemove);
  //   setSearchTags(newTags);
  //   handleInputChange(newTags, 'searchTags');
  // };

  /**
   * Handle tag input change
   * @param {Object} e Event object
   */
  // const handleTagInputChange = (e) => {
  //   setTagInput(e.target.value);
  // };

  /**
   * Handle tag input keydown events
   * @param {Object} e Event object
   */
  // const handleTagKeyDown = (e) => {
  //   if (e.key === 'Enter' && tagInput.trim()) {
  //     e.preventDefault();
  //     addTag(tagInput.trim());
  //   }
  // };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.stepIconImage}
            aria-hidden="true"
          >
            <path
              d="M9.75 3.5H6.25C4.73 3.5 3.5 4.73 3.5 6.25V9.75C3.5 11.27 4.73 12.5 6.25 12.5H9.75C11.27 12.5 12.5 11.27 12.5 9.75V6.25C12.5 4.73 11.27 3.5 9.75 3.5Z"
              stroke="#7C3AED"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.75 3.5H14.25C13.84 3.5 13.5 3.84 13.5 4.25V7.75C13.5 8.16 13.84 8.5 14.25 8.5H17.75C18.16 8.5 18.5 8.16 18.5 7.75V4.25C18.5 3.84 18.16 3.5 17.75 3.5Z"
              stroke="#7C3AED"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.75 13.5H14.25C13.84 13.5 13.5 13.84 13.5 14.25V17.75C13.5 18.16 13.84 18.5 14.25 18.5H17.75C18.16 18.5 18.5 18.16 18.5 17.75V14.25C18.5 13.84 18.16 13.5 17.75 13.5Z"
              stroke="#7C3AED"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.75 13.5H6.25C4.73 13.5 3.5 14.73 3.5 16.25V17.75C3.5 18.16 3.84 18.5 4.25 18.5H11.75C12.16 18.5 12.5 18.16 12.5 17.75V16.25C12.5 14.73 11.27 13.5 9.75 13.5Z"
              stroke="#7C3AED"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.stepTextContainer}>
          <h2 className={styles.stepTitle}>Basic Information</h2>
          <p className={styles.stepDescription}>Add the essential details to get your event started.</p>
        </div>
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

            value={eventData.name}
            onChange={handleInputChange}
          />
          {/* {!eventData.name && stepStatus.visited && (
            <div className={styles.fieldError}>Event name is required</div>
          )} */}
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
                  {/* Globe outline, with gap at the bottom right */}
                  <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 13.5615 21.642 15.0396 21 16.3473" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 12H21.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C16 13.9 15.5 15.6 14.5 17" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Checkmark circle */}
                  <circle cx="18" cy="18" r="5" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2"/>
                  <path d="M15.5 18L17 19.5L20.5 16" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.visibilityContent}>
                <h3 className={styles.visibilityTitle}>Public Event</h3>
                <p className={styles.visibilityDescription}>
                  Your event will be highlighted in the Explore section of Prizmatix.nz 
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
                  {/* Hat brim */}
                  <path d="M4 11H20" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Hat top */}
                  <path d="M6 11L7.5 5.5C7.8 4.2 8.7 3 10.5 3H13.5C15.3 3 16.2 4.2 16.5 5.5L18 11" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Left lens */}
                  <circle cx="7.5" cy="16.5" r="3.5" stroke="#666666" strokeWidth="2"/>
                  {/* Right lens */}
                  <circle cx="16.5" cy="16.5" r="3.5" stroke="#666666" strokeWidth="2"/>
                  {/* Glasses bridge */}
                  <path d="M11 16.5H13" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.visibilityContent}>
                <h3 className={styles.visibilityTitle}>Private Event</h3>
                <p className={styles.visibilityDescription}>
                  Your event won't be publicly listed and can only be accessed via a Link.
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

        {/* <div className={styles.formGroup}>
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
        </div> */}

        {/* <div className={styles.formGroup}>
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

            />
          </div>
        </div> */}
        
        {/* <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Host Profile
          </label>
          <p className={styles.formDescription}>
            Information about the event organizer that will be shown to attendees
          </p> */}
          
          {/* <div className={styles.hostProfileSection}> */}
            {/* <div className={styles.checkboxContainer}>
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
            </div> */}
            
            {/* Only show the host info card when showHostProfile is true */}
            {/* {eventData.showHostProfile && (
              <div 
                className={styles.hostInfoCard}
                onClick={toggleModal}
                role="button"
                tabIndex={0}
                aria-label="View host details"
              >
                <div className={styles.hostLogo}>
                  <img src="/icons/organizer-logo.svg" alt="Organiser logo" />
                </div>
                <div className={styles.hostDetails}>
                  <h4 className={styles.hostName}>{userData?.organizationName}</h4>
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
            )} */}

            {/* User Info Modal */}
            {/* {showModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h3>Organiser Information</h3>
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
                      <span className={styles.infoLabel}>Organisation:</span>
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
            )} */}
          {/* </div> */}
        {/* </div> */}
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