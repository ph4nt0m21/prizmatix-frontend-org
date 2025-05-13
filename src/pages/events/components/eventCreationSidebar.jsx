// eventCreationSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './eventCreationSidebar.module.scss';
import { GetEventStatusAPI } from '../../../services/allApis';
import { getEventData } from '../../../utils/eventUtil';

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
 */
const EventCreationSidebar = ({ 
  currentStep, 
  stepStatus, 
  navigateToStep, 
  eventId, 
  onStatusUpdate 
}) => {
  // Use a ref to prevent unnecessary API calls
  const prevEventIdRef = useRef(null);
  const prevStepRef = useRef(null);
  
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

  // Only fetch event status when eventId or currentStep actually changes
  useEffect(() => {
    const fetchEventStatus = async () => {
      // Get event ID from props or from localStorage if not provided
      const eventIdToUse = eventId || getEventData()?.eventId;
      
      // Only fetch if we have a valid eventId 
      // and if either eventId or currentStep has changed
      if (eventIdToUse && 
         (eventIdToUse !== prevEventIdRef.current || 
          currentStep !== prevStepRef.current)) {
        
        try {
          // Update refs to prevent further unnecessary API calls
          prevEventIdRef.current = eventIdToUse;
          prevStepRef.current = currentStep;
          
          console.log('Fetching event status for eventId:', eventIdToUse);
          
          // Make the API call to get event status
          const response = await GetEventStatusAPI(eventIdToUse);
          console.log('Event status data:', response.data);
          
          // Update step status based on API response if we have a callback
          if (typeof onStatusUpdate === 'function' && response.data) {
            // Map API response to our step status structure
            const updatedStepStatus = { ...stepStatus };
            
            // Update each step's completed status based on API response
            updatedStepStatus.basicInfo.completed = response.data.step1Completed || false;
            updatedStepStatus.location.completed = response.data.step2Completed || false;
            updatedStepStatus.dateTime.completed = response.data.step3Completed || false;
            updatedStepStatus.description.completed = response.data.step4Completed || false;
            updatedStepStatus.art.completed = response.data.step5Completed || false;
            updatedStepStatus.tickets.completed = response.data.step6Completed || false;
            updatedStepStatus.discountCodes.completed = response.data.step7Completed || false;
            updatedStepStatus.publish.completed = response.data.step8Completed || false;
            
            onStatusUpdate(updatedStepStatus);
          }
        } catch (error) {
          console.error('Error fetching event status:', error);
        }
      }
    };
    
    fetchEventStatus();
    
    // Clean up function to handle component unmounting
    return () => {
      // Nothing to clean up in this case
    };
  }, [eventId, currentStep]); // Only re-run when eventId or currentStep changes
  
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
    // Remove the restriction on navigation - allow clicking any step
    navigateToStep(step.number);
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
  navigateToStep: PropTypes.func.isRequired,
  eventId: PropTypes.string,
  onStatusUpdate: PropTypes.func
};

export default EventCreationSidebar;