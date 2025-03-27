import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './createEventButton.module.scss';

/**
 * CreateEventButton component specifically designed to match the button in the image
 * This is a standalone button component for creating events, styled exactly like the design
 * 
 * @param {Object} props Component props
 * @param {string} [props.className] Additional CSS class
 * @returns {JSX.Element} Create Event button component
 */
const CreateEventButton = ({ className = '' }) => {
  const navigate = useNavigate();
  
  /**
   * Handler for navigating to the event creation page
   */
  const handleClick = () => {
    navigate('/events/create');
  };
  
  // Combine CSS classes
  const buttonClasses = [
    styles.createEventButton,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button 
      type="button" 
      className={buttonClasses}
      onClick={handleClick}
      aria-label="Create Event"
    >
      <span className={styles.plusIcon}>+</span>
      <span className={styles.buttonText}>Create Event</span>
    </button>
  );
};

export default CreateEventButton;