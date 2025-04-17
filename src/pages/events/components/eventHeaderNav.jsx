// src/pages/events/components/EventHeaderNav.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './eventHeaderNav.module.scss';

/**
 * EventHeaderNav component displays the breadcrumb navigation and event status
 * 
 * @param {Object} props Component props
 * @param {string} props.currentStep Current step name
 * @param {string} props.eventName Event name
 * @param {boolean} props.isDraft Whether the event is in draft mode
 * @param {boolean} props.canPreview Whether the event can be previewed
 * @returns {JSX.Element} EventHeaderNav component
 */
const EventHeaderNav = ({ currentStep, eventName, isDraft, canPreview }) => {
  /**
   * Handle preview click
   */
  const handlePreview = () => {
    // In a real implementation, this would navigate to a preview page
    // or open a preview modal
    console.log('Preview event:', eventName);
  };

  return (
    <div className={styles.headerNav}>
      <div className={styles.headerContent}>
        <div className={styles.orgSection}>
          <div className={styles.orgLogo}>
            <img src="/icons/app-logo.svg" alt="Organization Logo" />
            <span className={styles.orgName}>City Music Festival</span>
            <span className={styles.verifiedBadge}>✓</span>
          </div>
          <button className={styles.orgDropdown}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search" 
            />
            <button className={styles.searchButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button
            className={styles.previewButton}
            onClick={handlePreview}
            disabled={!canPreview}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.42012 12.7132C2.28394 12.4975 2.21436 12.3897 2.17728 12.2234C2.14592 12.0785 2.14592 11.9215 2.17728 11.7766C2.21436 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.7865 11.6103 21.8236 11.7766C21.8549 11.9215 21.8549 12.0785 21.8236 12.2234C21.7865 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Preview</span>
          </button>
        </div>
      </div>
      
      <div className={styles.eventNav}>
        <div className={styles.breadcrumb}>
          <Link to="/events" className={styles.breadcrumbLink}>
            Events
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/events/create" className={styles.breadcrumbLink}>
            NORR Festival 2022
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Draft</span>
        </div>
      </div>
    </div>
  );
};

EventHeaderNav.propTypes = {
  currentStep: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  isDraft: PropTypes.bool,
  canPreview: PropTypes.bool
};

EventHeaderNav.defaultProps = {
  isDraft: true,
  canPreview: false
};

export default EventHeaderNav;