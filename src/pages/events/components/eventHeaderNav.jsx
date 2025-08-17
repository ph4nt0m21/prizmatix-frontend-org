import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './eventHeaderNav.module.scss';

// Import icons from assets folder
import { ReactComponent as ArrowIcon } from '../../../assets/icons/small-arrow-icon.svg';
import { ReactComponent as PreviewIcon } from '../../../assets/icons/preview-icon.svg';
// Removed specific ThreeDotsIcon import as it's now inlined

/**
 * EventHeaderNav component displays the breadcrumb navigation and event status.
 * It now includes a "3 dots" menu for mobile navigation specific to event creation/management.
 *
 * @param {Object} props Component props
 * @param {string} props.currentStep Current step name
 * @param {string} props.eventName Event name
 * @param {boolean} props.isDraft Whether the event is in draft mode
 * @param {boolean} props.canPreview Whether the event can be previewed
 * @param {Function} props.toggleMobileSidebar Function to toggle mobile sidebar visibility
 * @returns {JSX.Element} EventHeaderNav component
 */
const EventHeaderNav = ({ currentStep, eventName, isDraft, canPreview, toggleMobileSidebar }) => {
  return (
    <div className={styles.eventNav}>
      {/* "3 dots" menu icon for mobile (specific to Event Manage Header) */}
      <button className={styles.mobileSidebarToggleButton} onClick={toggleMobileSidebar} aria-label="Open menu">
        {/* Using the provided SVG directly */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="currentColor"/>
        </svg>
      </button>

      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumb}>
          <Link to="/events" className={styles.breadcrumbLink}>
            Events
          </Link>
          <span className={styles.breadcrumbSeparator}>
            <ArrowIcon />
          </span>
          {/* Conditionally render event name link based on whether it's the create page or manage page */}
          {eventName && currentStep !== "Create Event" ? (
            <Link to={`/events/manage/${eventName.toLowerCase().replace(/\s/g, '-')}/overview`} className={styles.breadcrumbLink}>
              {eventName}
            </Link>
          ) : (
            <span className={styles.breadcrumbLink}>{eventName}</span>
          )}
          {isDraft && (
            <>
              <span className={styles.breadcrumbDraft}>
                Draft
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

EventHeaderNav.propTypes = {
  currentStep: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  isDraft: PropTypes.bool,
  canPreview: PropTypes.bool,
  toggleMobileSidebar: PropTypes.func.isRequired, // Added propType
};

EventHeaderNav.defaultProps = {
  isDraft: true,
  canPreview: false
};

export default EventHeaderNav;

