import React from 'react';
import PropTypes from 'prop-types';
import styles from './editEventSidebar.module.scss'; // Link to new SCSS module

// Import SVG components (reusing existing ones)
import { ReactComponent as BasicInfoIcon } from '../../../assets/icons/basic-info-icon.svg';
import { ReactComponent as LocationIcon } from '../../../assets/icons/location-icon.svg';
import { ReactComponent as DateIcon } from '../../../assets/icons/date-icon.svg';
import { ReactComponent as DescriptionIcon } from '../../../assets/icons/description-icon.svg';
import { ReactComponent as ArtIcon } from '../../../assets/icons/art-icon.svg';

/**
 * EditEventSidebar component displays the steps for event editing
 * and tracks the progress of completion. It is a simplified version of
 * EventCreationSidebar.
 */
const EditEventSidebar = ({
  currentStep,
  stepStatus,
  navigateToStep,
  eventId
}) => {

  // Steps configuration (modified from eventCreationSidebar)
  // Excludes Tickets, Discount Codes, and Publish steps
  const steps = [
    { number: 1, key: 'basicInfo', label: 'Basic Info', icon: BasicInfoIcon },
    { number: 2, key: 'location', label: 'Location', icon: LocationIcon },
    { number: 3, key: 'dateTime', label: 'Date & Time', icon: DateIcon },
    { number: 4, key: 'description', label: 'Description', icon: DescriptionIcon },
    { number: 5, key: 'art', label: 'Art', icon: ArtIcon },
  ];

  /**
   * Get CSS class for a step based on its status
   * @param {Object} step Step object
   * @returns {string} CSS class
   */
  const getStepClass = (step) => {
    const status = stepStatus[step.key];
    const isActive = currentStep === step.number;

    if (isActive) return `${styles.step} ${styles.active}`;
    if (status && status.completed) return `${styles.step} ${styles.completed}`;
    if (status && status.visited) return `${styles.step} ${styles.visited}`;
    return styles.step;
  };

  /**
   * Handle click on a step
   * @param {Object} step Step object
   */
  const handleStepClick = (step) => {
    // Only allow navigation if we have a valid eventId
    if (!eventId) {
      alert("Event ID is required to edit this event.");
      return;
    }
    navigateToStep(step.number);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Edit Event</h2>
        <p className={styles.sidebarSubtitle}>Update your event details</p>
      </div>

      <div className={styles.stepsList}>
        {steps.map((step) => {
          const IconComponent = step.icon; // Get the SVG component
          const status = stepStatus[step.key];
          const isActive = currentStep === step.number;
          const isCompleted = status ? status.completed : false;

          return (
            <div
              key={step.key}
              className={getStepClass(step)}
              onClick={() => handleStepClick(step)}
            >
              <div className={styles.stepIconContainer}>
                <IconComponent className={styles.stepIcon} />
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              <div
                className={`${styles.stepStatusIndicator} ${
                  isActive ? styles.activeIndicator :
                  isCompleted ? styles.completedIndicator : ''
                }`}
              >
                {isCompleted && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#FFFFFF"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Removed the progressInfoContainer from here */}
    </div>
  );
};

EditEventSidebar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  stepStatus: PropTypes.object.isRequired,
  navigateToStep: PropTypes.func.isRequired,
  eventId: PropTypes.string
};

export default EditEventSidebar;