// src/layout/header/header.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getUserData } from '../../utils/authUtil';
import styles from './header.module.scss';

/**
 * Header component displays the organization info, search bar, and create event button
 * Refactored to match the new design specifications and hide Create Event button on specific pages
 */
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  // Check if authenticated directly using cookies
  const isAuthenticated = !!Cookies.get('token');
  
  // Determine if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Check if we're in the event creation flow
  const isEventCreationRoute = location.pathname.includes('/events/create');
  
  // Check if we're on the events page
  const isEventsPage = location.pathname === '/events' || location.pathname === '/events/';
  
  // Fetch user data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const userInfo = getUserData();
      if (userInfo) {
        setUserData(userInfo);
      }
    }
  }, [isAuthenticated]);
  
  // Handler for the Create Event button
  const handleCreateEvent = () => {
    navigate('/events/create');
  };
  
  // Get organization initials for logo
  const getOrgInitials = () => {
    if (userData?.organizationName) {
      const nameParts = userData.organizationName.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return userData.organizationName.substring(0, 2).toUpperCase();
    }
    return 'CF'; // Default fallback
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.orgInfo}>
        <div className={styles.orgLogo}>
          <span>{getOrgInitials()}</span>
        </div>
        <div className={styles.orgDetails}>
          <span className={styles.orgLabel}>Organisation</span>
          <h2 className={styles.orgName}>{userData?.organizationName || 'City Music Festival'}</h2>
        </div>
      </div>
      
      <div className={styles.headerActions}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        {/* Only show Create Event button when not in event creation flow or events page */}
        {!isEventCreationRoute && !isEventsPage && (
          <button 
            type="button" 
            className={styles.createEventButton}
            onClick={handleCreateEvent}
          >
            <span className={styles.plusIcon}>+</span>
            Create Event
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;