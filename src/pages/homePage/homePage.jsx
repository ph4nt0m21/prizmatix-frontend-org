// src/pages/homePage/homePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import styles from './homePage.module.scss';

/**
 * HomePage component for the main dashboard view
 * Uses AuthContext instead of Redux for authentication state
 * 
 * @returns {JSX.Element} The HomePage component
 */
const HomePage = () => {
  const navigate = useNavigate();
  
  // Get auth data from context
  const { currentUser, isAuthenticated } = useAuth();
  
  /**
   * Handler for navigating to the event creation page
   */
  const handleCreateEvent = () => {
    if (isAuthenticated) {
      navigate('/events/create');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <div className={styles.homePageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            {isAuthenticated && currentUser?.name
              ? `Welcome, ${currentUser.name}`
              : 'Welcome to Ticket Booking'}
          </h1>
          <p className={styles.welcomeText}>
            Manage your events and ticket sales in one place.
          </p>
          
          <button 
            className={styles.createEventButton}
            onClick={handleCreateEvent}
          >
            <span className={styles.plusIcon}>+</span>
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;