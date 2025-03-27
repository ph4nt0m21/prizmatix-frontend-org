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
      <div className={styles.breadcrumb}>
        <Link to="/events" className={styles.breadcrumbLink}>
          Events
        </Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <Link to="/events/create" className={styles.breadcrumbLink}>
          New Event
        </Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{eventName}</span>
        
        {isDraft && (
          <span className={styles.draftBadge}>Draft</span>
        )}
      </div>
      
      <div className={styles.actions}>
        <button
          className={styles.previewButton}
          onClick={handlePreview}
          disabled={!canPreview}
        >
          Preview
        </button>
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