// src/pages/auth/registerSteps/createEvent.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../authPages.module.scss';

/**
 * CreateEvent component - Step for setting up the first event
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Function} props.handleSubmit - Function to submit the form
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} CreateEvent component
 */
const CreateEvent = ({ 
  formData, 
  handleChange, 
  nextStep, 
  handleSubmit,
  errors, 
  isLoading 
}) => {
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
      } else {
        // Show validation errors
        return;
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

  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.loginHeader}>
        <h1 className={styles.welcomeTitle}>Create Event</h1>
        <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
      </div>
      
      {/* Display any errors if they exist */}
      {(errors?.eventName) && (
        <div className={styles.errorMessage}>
          {errors?.eventName}
        </div>
      )}
      
      <form className={styles.loginForm} onSubmit={onSubmit}>
        {/* Event Name */}
        <div className={styles.formGroup}>
          <label htmlFor="eventName" className={styles.inputLabelModern}>
            Event Name
          </label>
          <p className={styles.eventNameHint}>
            Enter the official name of your event that will be displayed to attendees
          </p>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="eventName"
              name="eventName"
              className={styles.modernInput}
              placeholder="eg. johndoe@gmail.com"
              value={formData.eventName || ''}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Actions Row */}
        <div className={styles.eventActionsRow}>
          <button
            type="button"
            className={styles.skipEventButton}
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for now and explore
          </button>
          
          <button
            type="submit"
            className={styles.createEventButton}
            disabled={isLoading || (!formData.eventName && !skipEvent)}
          >
            {isLoading ? (
              <span className={styles.buttonSpinner}></span>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

CreateEvent.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool
};

export default CreateEvent;