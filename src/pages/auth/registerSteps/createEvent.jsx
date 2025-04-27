import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './createEvent.module.scss';

// Import SVG components
import { ReactComponent as ArrowIcon } from "../../../assets/icons/arrow-icon.svg";

// Import images
import wallpaperBg from "../../../assets/images/register2-bg.png";
import logoImage from "../../../assets/images/logo2.svg";

/**
 * CreateEvent component - Final step of the registration process
 * Collects event information or allows skipping to complete registration
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.handleSubmit - Function to submit the form
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onGoBack - Function to handle going back
 * @returns {JSX.Element} CreateEvent component
 */
const CreateEvent = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  errors, 
  isLoading,
  onGoBack
}) => {
  // State for skipping event creation
  const [skipEvent, setSkipEvent] = useState(false);
  
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const onSubmit = (e) => {
    e.preventDefault();
    // Check if user wants to skip or create event
    if (skipEvent) {
      // Just complete registration without event
      handleSubmit();
    } else {
      // Create event and complete registration
      if (formData.eventName?.trim()) {
        handleSubmit();
      }
    }
  };
  
  /**
   * Handle skip event
   */
  const handleSkip = () => {
    setSkipEvent(true);
    handleSubmit();
  };
  
  // Render error message if exists
  const renderErrorMessage = () => {
    if (!errors || !errors.eventName) return null;
    
    return <div className={styles.errorMessage}>{errors.eventName}</div>;
  };

  return (
    <div className={styles.loginPanel}>
      {/* Left Panel with dark background */}
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
        <div className={styles.leftPanelContent}>
          <img src={logoImage} alt="Prizmatix Logo" className={styles.leftLogo} />
        </div>
      </div>

      {/* Right Panel with form */}
      <div className={styles.rightPanel}>
        {/* Header with back button and steps indicator */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={onGoBack}
            aria-label="Go back"
          >
            <ArrowIcon className={styles.backIcon} />
          </button>
          
          {/* Step indicator */}
          <div className={styles.stepsIndicator}>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.active}`}></div>
          </div>
          
          <div className={styles.emptySpace}></div>
        </div>
        
        {/* Main content with form */}
        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Create Event
            </h1>
            <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
          </div>
          
          {renderErrorMessage()}
          
          <form onSubmit={onSubmit} className={styles.form}>
            {/* Event Name */}
            <div className={styles.formGroup}>
              <label htmlFor="eventName" className={styles.inputLabel}>
                Event Name
              </label>
              <p className={styles.eventHint}>
                Enter the official name of your event that will be displayed to attendees
              </p>
              <input
                type="text"
                id="eventName"
                name="eventName"
                className={styles.input}
                placeholder="eg. johndoe@gmail.com"
                value={formData.eventName || ''}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors?.eventName && (
                <span className={styles.fieldError}>{errors.eventName}</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.skipButton}
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip for now and explore
                </button>
                
                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={isLoading || (!formData.eventName && !skipEvent)}
                >
                  {isLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.copyright}>
            Copyright © 2025 <span className={styles.companyName}>Prizmatix</span>
          </p>
        </div>
      </div>
    </div>
  );
};

CreateEvent.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  onGoBack: PropTypes.func.isRequired
};

export default CreateEvent;