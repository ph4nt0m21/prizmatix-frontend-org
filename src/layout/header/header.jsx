import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import styles from './header.module.scss';

/**
 * Header component displays the current page title and create event button
 */
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get auth state from AuthContext
  const { isAuthenticated } = useAuth();
  
  // Determine if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Handler for the Create Event button
  const handleCreateEvent = () => {
    navigate('/events/create');
  };
  
  // Get the page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/events/create':
        return 'Create Event';
      case '/events':
        return 'Events';
      case '/tickets':
        return 'Tickets';
      case '/analytics':
        return 'Analytics';
      default:
        return '';
    }
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{getPageTitle()}</h1>
      </div>
      
      <div className={styles.actionsContainer}>
        {isHomePage && isAuthenticated && (
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