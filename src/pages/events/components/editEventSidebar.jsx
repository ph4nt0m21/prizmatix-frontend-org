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
 *
 * @param {Object} props Component props
 * @param {number} props.currentStep - The currently active step number.
 * @param {Object} props.stepStatus - Object containing completion/visited status for each step.
 * @param {Function} props.navigateToStep - Function to navigate to a specific step.
 * @param {string} props.eventId - The ID of the event being edited.
 * @param {boolean} props.isMobileSidebarOpen - Controls if the sidebar is open on mobile.
 * @param {Function} props.toggleMobileSidebar - Function to toggle mobile sidebar visibility.
 * @returns {JSX.Element} EditEventSidebar component
 */
const EditEventSidebar = ({
  currentStep,
  stepStatus,
  navigateToStep,
  eventId,
  isMobileSidebarOpen, // Prop for mobile sidebar state
  toggleMobileSidebar // Prop for mobile sidebar toggle function
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
    const status = stepStatus[step.key] || {}; // Provide default empty object
    const isActive = currentStep === step.number;

    if (isActive) return `${styles.step} ${styles.active}`;
    if (status.completed) return `${styles.step} ${styles.completed}`;
    if (status.visited) return `${styles.step} ${styles.visited}`;
    return styles.step;
  };

  /**
   * Handle click on a step.
   * Also closes the mobile sidebar if it's open.
   * @param {Object} step Step object
   */
  const handleStepClick = (step) => {
    // Only allow navigation if we have a valid eventId
    if (!eventId) {
      alert("Event ID is required to edit this event.");
      return;
    }
    navigateToStep(step.number);
    // Close the mobile sidebar after navigation
    if (window.innerWidth <= 768 && isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  return (
    <div className={`${styles.sidebar} ${isMobileSidebarOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Edit Event</h2>
        <p className={styles.sidebarSubtitle}>Update your event details</p>
      </div>

      <div className={styles.stepsList}>
        {steps.map((step) => {
          const IconComponent = step.icon; // Get the SVG component
          const status = stepStatus[step.key] || {}; // Provide default empty object
          const isActive = currentStep === step.number;
          const isCompleted = status.completed;

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
            </div>
          );
        })}
      </div>
    </div>
  );
};

EditEventSidebar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  stepStatus: PropTypes.object.isRequired,
  navigateToStep: PropTypes.func.isRequired,
  eventId: PropTypes.string.isRequired,
  isMobileSidebarOpen: PropTypes.bool.isRequired, // Added propType
  toggleMobileSidebar: PropTypes.func.isRequired, // Added propType
};

export default EditEventSidebar;