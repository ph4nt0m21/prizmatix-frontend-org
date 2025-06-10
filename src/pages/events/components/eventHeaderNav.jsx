/*
File: src/pages/events/components/EventHeaderNav.jsx
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './eventHeaderNav.module.scss';

// Import icons from assets folder
import { ReactComponent as ArrowIcon } from '../../../assets/icons/small-arrow-icon.svg';
import { ReactComponent as PreviewIcon } from '../../../assets/icons/preview-icon.svg';

/**
 * EventHeaderNav component displays the breadcrumb navigation and event status
 * Modified to use specific icon files from the assets folder
 *
 * @param {Object} props Component props
 * @param {string} props.currentStep Current step name (e.g., "Basic Info", "Overview")
 * @param {string} props.eventName Event name
 * @param {boolean} props.isDraft Whether the event is in draft mode
 * @param {boolean} props.canPreview Whether the event can be previewed
 * @param {string} props.context 'create' or 'edit' to determine breadcrumb path
 * @param {string} props.eventId Event ID, necessary for correct navigation links
 * @returns {JSX.Element} EventHeaderNav component
 */
const EventHeaderNav = ({ currentStep, eventName, isDraft, canPreview, context, eventId }) => {
  /**
   * Handle preview click
   */
  const handlePreview = () => {
    // In a real implementation, this would navigate to a preview page
    // or open a preview modal
    console.log('Preview event:', eventName);
  };

  const getEventLinkPath = () => {
    if (context === 'create') {
      return `/events/create/${eventId}/1`; // Link to the first step of creation
    } else if (context === 'edit') {
      return `/events/manage/${eventId}/overview`; // Link to the overview section of manage event
    }
    return '#'; // Fallback
  };

  return (
    <div className={styles.eventNav}>
      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumb}>
          {context === 'create' && (
            <>
              <Link to="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <span className={styles.breadcrumbSeparator}>
                <ArrowIcon />
              </span>
              <Link to={getEventLinkPath()} className={styles.breadcrumbLink}>
                {eventName}
              </Link>
            </>
          )}

          {context === 'edit' && (
            <>
              <Link to="/events" className={styles.breadcrumbLink}>
                Events
              </Link>
              <span className={styles.breadcrumbSeparator}>
                <ArrowIcon />
              </span>
              <Link to={`/events/manage/${eventId}/overview`} className={styles.breadcrumbLink}>
                Manage Events
              </Link>
              <span className={styles.breadcrumbSeparator}>
                <ArrowIcon />
              </span>
              <Link to={getEventLinkPath()} className={styles.breadcrumbLink}>
                {eventName}
              </Link>
            </>
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

      <div className={styles.actionButtons}>
        <button
          className={styles.previewButton}
          onClick={handlePreview}
          disabled={!canPreview}
        >
          <PreviewIcon className={styles.previewIcon} />
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
  canPreview: PropTypes.bool,
  context: PropTypes.oneOf(['create', 'edit']).isRequired, // New prop
  eventId: PropTypes.string.isRequired, // New prop
};

EventHeaderNav.defaultProps = {
  isDraft: true,
  canPreview: false,
};

export default EventHeaderNav;