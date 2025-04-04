import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './homePage.module.scss';

/**
 * HomePage component for the main dashboard view
 * Uses direct authentication instead of AuthContext
 * 
 * @returns {JSX.Element} The HomePage component
 */
const HomePage = () => {
  const navigate = useNavigate();
  
  // State for user and authentication
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  /**
   * Check if the user is authenticated based on token presence
   */
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      
      if (token) {
        // Token exists, try to fetch user profile
        try {
          const response = await LoginAPI(token);
          setCurrentUser(response.data);
          setIsAuthenticated(true);
          console.log('User profile:', response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Even if profile fetch fails, if token exists, consider authenticated
          setIsAuthenticated(true);
        }
      } else {
        // No token, not authenticated
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  // Display loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className={styles.homePageContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  
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