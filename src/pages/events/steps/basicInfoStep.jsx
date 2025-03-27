// src/pages/events/steps/BasicInfoStep.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './steps.module.scss';

/**
 * BasicInfoStep component - First step of event creation
 * Collects basic event information like name and type
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} BasicInfoStep component
 */
const BasicInfoStep = ({ eventData, handleInputChange, isValid, stepStatus }) => {
  // Event type options
  const eventTypes = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ];
  
  /**
   * Handle checkbox changes
   * @param {Object} e Event object
   */
  // const handleCheckboxChange = (e) => {
  //   handleInputChange(e);
  // };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Event Basic Information</h2>
        <p className={styles.stepDescription}>List your basic event details below.</p>
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.formLabel}>
            Event Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.formInput}
            placeholder="Input"
            value={eventData.name}
            onChange={handleInputChange}
          />
          {!eventData.name && stepStatus.visited && (
            <div className={styles.fieldError}>Event name is required</div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="eventType" className={styles.formLabel}>
            Event Type
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="eventType"
              name="eventType"
              className={styles.formSelect}
              value={eventData.eventType}
              onChange={handleInputChange}
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className={styles.selectArrow}>▼</div>
          </div>

        </div>
        
        {/* <div className={styles.formGroup}>
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
              Show Host Profile on the tickets page
            </label>
          </div>
        </div> */}
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