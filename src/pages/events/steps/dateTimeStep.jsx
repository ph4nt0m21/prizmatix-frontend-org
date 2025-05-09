import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './dateTimeStep.module.scss';

/**
 * DateTimeStep component - Third step of event creation
 * Collects event date and time information for both start and end
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} DateTimeStep component
 */
const DateTimeStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false }
}) => {
  // Extract dateTime data from eventData or use defaults
  const dateTimeData = eventData.dateTime || {};
  
  // Local state for form management
  const [dateTime, setDateTime] = useState({
    startDate: dateTimeData.startDate || '',
    startTime: dateTimeData.startTime || '',
    endDate: dateTimeData.endDate || '',
    endTime: dateTimeData.endTime || '',
  });
  
  /**
   * Handle input changes
   * @param {Object} e Event object
   */
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    setDateTime(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Effect to propagate dateTime changes to parent component
  useEffect(() => {
    // Send the updated dateTime data to parent component
    handleInputChange(dateTime, 'dateTime');
  }, [dateTime, handleInputChange]);
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Date of the event</h2>
      </div>
      
      <div className={styles.formSection}>
        {/* Event Start Details */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Event Start Details
          </label>
          <p className={styles.formDescription}>
            The start date and time of your event that will appear on the event page
          </p>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.formLabel}>
                Start Date
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className={styles.formInput}
                  value={dateTime.startDate}
                  onChange={handleFieldChange}
                  min={new Date().toISOString().split('T')[0]} // Min date is today
                />
                <div className={styles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H12V16H7V11Z" fill="#7C3AED"/>
                  </svg>
                </div>
              </div>
              {stepStatus.visited && !dateTime.startDate && (
                <div className={styles.fieldError}>Start date is required</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="startTime" className={styles.formLabel}>
                Start Time
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className={styles.formInput}
                  value={dateTime.startTime}
                  onChange={handleFieldChange}
                />
                <div className={styles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#7C3AED"/>
                  </svg>
                </div>
              </div>
              {stepStatus.visited && !dateTime.startTime && (
                <div className={styles.fieldError}>Start time is required</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Event End Details */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Event End Details
          </label>
          <p className={styles.formDescription}>
            The end date and time of your event that will appear on the event page
          </p>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.formLabel}>
                End Date
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className={styles.formInput}
                  value={dateTime.endDate}
                  onChange={handleFieldChange}
                  min={dateTime.startDate || new Date().toISOString().split('T')[0]} // Min date is start date or today
                />
                <div className={styles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H12V16H7V11Z" fill="#7C3AED"/>
                  </svg>
                </div>
              </div>
              {stepStatus.visited && !dateTime.endDate && (
                <div className={styles.fieldError}>End date is required</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="endTime" className={styles.formLabel}>
                End Time
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  className={styles.formInput}
                  value={dateTime.endTime}
                  onChange={handleFieldChange}
                />
                <div className={styles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#7C3AED"/>
                  </svg>
                </div>
              </div>
              {stepStatus.visited && !dateTime.endTime && (
                <div className={styles.fieldError}>End time is required</div>
              )}
            </div>
          </div>
        </div>

        {/* Timezone info - provides context to the user */}
        <div className={styles.formGroup}>
          <p className={styles.timezoneInfo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666"/>
            </svg>
            All times are in your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
      </div>
    </div>
  );
};

DateTimeStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default DateTimeStep;