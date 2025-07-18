// src/pages/events/components/EventHeaderNav.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './eventHeaderNav.module.scss';

// Import icons from assets folder
import { ReactComponent as ArrowIcon } from '../../../assets/icons/small-arrow-icon.svg';
import { ReactComponent as PreviewIcon } from '../../../assets/icons/preview-icon.svg';
// Import Hamburger Icon
import { ReactComponent as HamburgerIcon } from '../../../assets/icons/hamburger-menu-icon.svg';


/**
 * EventHeaderNav component displays the breadcrumb navigation and event status.
 * Now includes a hamburger menu for mobile navigation.
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
      {/* Hamburger menu icon for mobile */}
      <button className={styles.hamburgerButton} onClick={toggleMobileSidebar} aria-label="Open menu">
        <HamburgerIcon />
      </button>

      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumb}>
          <Link to="/events" className={styles.breadcrumbLink}>
            Events
          </Link>
          <span className={styles.breadcrumbSeparator}>
            <ArrowIcon />
          </span>
          <Link to="/events/create" className={styles.breadcrumbLink}>
            {eventName}
          </Link>
          {/* {isDraft && (
            <>
              <span className={styles.breadcrumbDraft}>
                Draft
              </span>
            </>
          )} */}
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