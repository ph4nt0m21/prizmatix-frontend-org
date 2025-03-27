// src/pages/events/components/EventCreationSidebar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './eventCreationSidebar.module.scss';

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
  // Steps configuration
  const steps = [
    { number: 1, key: 'basicInfo', label: 'Basic Info', icon: '📝' },
    { number: 2, key: 'location', label: 'Location', icon: '📍' },
    { number: 3, key: 'dateTime', label: 'Date', icon: '📅' },
    { number: 4, key: 'description', label: 'Description', icon: '📄' },
    { number: 5, key: 'art', label: 'Art', icon: '🖼️' },
    { number: 6, key: 'tickets', label: 'Tickets', icon: '🎟️' },
    { number: 7, key: 'discountCodes', label: 'Discount Codes', icon: '🏷️' },
    { number: 8, key: 'publish', label: 'Publish', icon: '🚀' }
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
   * Get status icon for a step
   * @param {Object} step Step object
   * @returns {JSX.Element} Status icon
   */
  const getStatusIcon = (step) => {
    const status = stepStatus[step.key];
    const isActive = currentStep === step.number;
    
    if (isActive) {
      return <div className={styles.stepIndicator}>{step.number}</div>;
    }
    
    if (status.completed) {
      return <div className={styles.completedIcon}>✓</div>;
    }
    
    return <div className={styles.stepIndicator}>{step.number}</div>;
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
      <div className={styles.stepsList}>
        {steps.map((step) => (
          <div
            key={step.key}
            className={getStepClass(step)}
            onClick={() => handleStepClick(step)}
          >
            <div className={styles.stepIcon}>
              {getStatusIcon(step)}
            </div>
            <div className={styles.stepInfo}>
              <div className={styles.stepLabel}>{step.label}</div>
            </div>
          </div>
        ))}
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