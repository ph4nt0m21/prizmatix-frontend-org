import React from 'react';
import PropTypes from 'prop-types';
import styles from './eventCreationSidebar.module.scss';

// Import SVG components
import { ReactComponent as BasicInfoIcon } from '../../../assets/icons/basic-info-icon.svg';
import { ReactComponent as LocationIcon } from '../../../assets/icons/location-icon.svg';
import { ReactComponent as DateIcon } from '../../../assets/icons/date-icon.svg';
import { ReactComponent as DescriptionIcon } from '../../../assets/icons/description-icon.svg';
import { ReactComponent as ArtIcon } from '../../../assets/icons/art-icon.svg';
import { ReactComponent as TicketsIcon } from '../../../assets/icons/tickets-icon.svg';
import { ReactComponent as DiscountIcon } from '../../../assets/icons/discount-icon.svg';
import { ReactComponent as PublishIcon } from '../../../assets/icons/publish-icon.svg';

/**
 * EventCreationSidebar component displays the steps of event creation
 * and tracks the progress of completion
 * 
 * @param {Object} props Component props
 * @param {number} props.currentStep Current step number
 * @param {Object} props.stepStatus Status of each step (completed, valid, visited)
 * @param {Function} props.navigateToStep Function to navigate to a step
 * @returns {JSX.Element} EventCreationSidebar component
 */
const EventCreationSidebar = ({ currentStep, stepStatus, navigateToStep }) => {
  // Steps configuration with imported SVG components
  const steps = [
    { number: 1, key: 'basicInfo', label: 'Basic Info', icon: BasicInfoIcon },
    { number: 2, key: 'location', label: 'Location', icon: LocationIcon },
    { number: 3, key: 'dateTime', label: 'Date', icon: DateIcon },
    { number: 4, key: 'description', label: 'Description', icon: DescriptionIcon },
    { number: 5, key: 'art', label: 'Art', icon: ArtIcon },
    { number: 6, key: 'tickets', label: 'Tickets', icon: TicketsIcon },
    { number: 7, key: 'discountCodes', label: 'Discount Codes', icon: DiscountIcon },
    { number: 8, key: 'publish', label: 'Publish', icon: PublishIcon }
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
    if (status.completed) return `${styles.step} ${styles.completed}`;
    if (status.visited) return `${styles.step} ${styles.visited}`;
    return styles.step;
  };
  
  /**
   * Handle click on a step
   * @param {Object} step Step object
   */
  const handleStepClick = (step) => {
    // Can only navigate to completed steps or the next incomplete step
    const canNavigate = stepStatus[step.key].completed || step.number === 1 || 
                        stepStatus[steps[step.number - 2].key].completed;
    
    if (canNavigate) {
      navigateToStep(step.number);
    }
  };
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Create Event</h2>
        <p className={styles.sidebarSubtitle}>These are the steps for creating your event</p>
      </div>
      
      <div className={styles.stepsList}>
        {steps.map((step) => {
          const IconComponent = step.icon;
          const status = stepStatus[step.key];
          const isActive = currentStep === step.number;
          return (
            <div
              key={step.key}
              className={getStepClass(step)}
              onClick={() => handleStepClick(step)}
            >
              <div className={styles.stepIconContainer}>
                <IconComponent className={styles.stepIcon} />
                <div className={`${styles.stepStatusIndicator} ${isActive || status.completed ? styles.filled : ''}`}></div>
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Separate progress info div with new styling */}
      <div className={styles.progressInfoContainer}>
        <div className={styles.progressText}>Step {currentStep} of {steps.length}</div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

EventCreationSidebar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  stepStatus: PropTypes.object.isRequired,
  navigateToStep: PropTypes.func.isRequired
};

export default EventCreationSidebar;