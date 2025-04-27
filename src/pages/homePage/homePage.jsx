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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  
  return (
    <div className={styles.homePageContainer}>
      {/* Promotion Banner */}
      <div className={styles.promotionBanner}>
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>Elevate your Ticketing Experience</h2>
          <p className={styles.bannerText}>
            Welcome to Prizmatix! We're excited to help you list your event. Just follow these steps: provide the event name, date, and a brief description. Include venue details and ticket pricing. Hit submit, and your event will be live!
          </p>
          <button className={styles.learnMoreButton}>Learn More</button>
        </div>
      </div>
      
      {/* Overview Section */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Basic Overview</h2>
          <div className={styles.sectionActions}>
            <button className={styles.actionButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="currentColor"/>
              </svg>
              August
            </button>
            <button className={styles.actionButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/>
              </svg>
              Filter
            </button>
            <button className={styles.actionButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
              </svg>
              Export
            </button>
          </div>
        </div>
        
        {/* Empty State */}
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="40" rx="4" fill="#F0F0F0" transform="translate(10 20)"/>
              <rect width="40" height="30" rx="4" fill="#FAFAFA" transform="translate(20 25)"/>
            </svg>
          </div>
          <h3 className={styles.emptyStateTitle}>
            Welcome {currentUser?.name}! Please create an event to get started.
          </h3>
          <button 
            className={styles.createEventButton}
            onClick={handleCreateEvent}
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;