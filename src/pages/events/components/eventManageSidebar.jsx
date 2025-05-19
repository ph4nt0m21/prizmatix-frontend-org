
import React from 'react';
import PropTypes from 'prop-types';
import styles from './eventManageSidebar.module.scss';

/**
 * EventManageSidebar component displays the sections for event management
 * and tracks the active section
 */
const EventManageSidebar = ({ 
  currentSection, 
  sectionStatus, 
  navigateToSection, 
  eventId
}) => {
  // Define sections with inline SVG icons instead of imported components
  const sections = [
    // Manage Event section
    { 
      key: 'overview', 
      label: 'Overview', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
        </svg>
      ),
      group: 'manage' 
    },
    { 
      key: 'ordersAndAttendees', 
      label: 'Orders & Attendees', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
        </svg>
      ),
      group: 'manage' 
    },
    { 
      key: 'payout', 
      label: 'Payout', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.82 1.62 2.45 1.62 1.79 0 2.44-.9 2.44-1.87 0-.95-.65-1.87-2.64-2.44-2.48-.74-4.04-1.76-4.04-3.85 0-1.94 1.47-3.19 3.1-3.56V2.7h2.67v1.92c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 2.04 2.33.74 4.01 1.73 4.01 3.88 0 2.03-1.62 3.45-3.33 3.76z" fill="currentColor"/>
        </svg>
      ),
      group: 'manage' 
    },
    { 
      key: 'promotions', 
      label: 'Promotions', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.53 11.06L15.47 10l-4.88 4.88-2.12-2.12-1.06 1.06L10.59 17l5.94-5.94zM19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="currentColor"/>
        </svg>
      ),
      group: 'manage' 
    },
    
    // Edit Event section
    { 
      key: 'eventPage', 
      label: 'Event Page', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
        </svg>
      ),
      group: 'edit' 
    },
    { 
      key: 'tickets', 
      label: 'Tickets', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z" fill="currentColor"/>
        </svg>
      ),
      group: 'edit' 
    }
  ];

  /**
   * Get CSS class for a section based on its status
   * @param {Object} section Section object
   * @returns {string} CSS class
   */
  const getSectionClass = (section) => {
    const status = sectionStatus[section.key];
    const isActive = currentSection === section.key;
    
    if (isActive) return `${styles.section} ${styles.active}`;
    if (status.completed) return `${styles.section} ${styles.completed}`;
    if (status.visited) return `${styles.section} ${styles.visited}`;
    return styles.section;
  };
  
  /**
   * Handle click on a section
   * @param {Object} section Section object
   */
  const handleSectionClick = (section) => {
    // Only allow navigation if we have a valid eventId
    if (!eventId) {
      alert("Event ID is required to manage this event.");
      return;
    }
    
    // Navigate to the selected section
    navigateToSection(section.key);
  };

  // Filter sections by group
  const manageSections = sections.filter(section => section.group === 'manage');
  const editSections = sections.filter(section => section.group === 'edit');
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Manage Event</h2>
        <p className={styles.sidebarSubtitle}>Use these tools to manage your event</p>
      </div>
      
      <div className={styles.sectionsList}>
        {/* Manage Event Sections */}
        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Manage Event</h3>
          {manageSections.map((section) => {
            const status = sectionStatus[section.key];
            const isActive = currentSection === section.key;
            const isCompleted = status.completed;
            
            return (
              <div
                key={section.key}
                className={getSectionClass(section)}
                onClick={() => handleSectionClick(section)}
              >
                <div className={styles.sectionIconContainer}>
                  {section.icon}
                </div>
                <span className={styles.sectionLabel}>{section.label}</span>
                <div 
                  className={`${styles.sectionStatusIndicator} ${
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
        
        {/* Edit Event Sections */}
        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Edit Event</h3>
          {editSections.map((section) => {
            const status = sectionStatus[section.key];
            const isActive = currentSection === section.key;
            const isCompleted = status.completed;
            
            return (
              <div
                key={section.key}
                className={getSectionClass(section)}
                onClick={() => handleSectionClick(section)}
              >
                <div className={styles.sectionIconContainer}>
                  {section.icon}
                </div>
                <span className={styles.sectionLabel}>{section.label}</span>
                <div 
                  className={`${styles.sectionStatusIndicator} ${
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
      </div>
      
      {/* Duplicate and Delete Event Buttons */}
      <div className={styles.eventActions}>
        <button className={styles.duplicateButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="#6B7280"/>
          </svg>
          Duplicate Event
        </button>
        <button className={styles.deleteButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444"/>
          </svg>
          Delete Event
        </button>
      </div>
    </div>
  );
};

EventManageSidebar.propTypes = {
  currentSection: PropTypes.string.isRequired,
  sectionStatus: PropTypes.object.isRequired,
  navigateToSection: PropTypes.func.isRequired,
  eventId: PropTypes.string
};

export default EventManageSidebar;