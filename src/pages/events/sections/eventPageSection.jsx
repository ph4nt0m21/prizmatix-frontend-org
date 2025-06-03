import React from 'react';
import PropTypes from 'prop-types';
import styles from './eventPageSection.module.scss';

/**
 * EventPageSection component - Template for other sections
 * This can be used as a base for the remaining section components
 * 
 * @param {Object} props Component props
 * @param {string} props.title Section title to display
 * @param {string} props.description Brief description of the section
 * @returns {JSX.Element} EventPageSection component
 */
const EventPageSection = ({ title, description }) => {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDescription}>
          {description}
        </p>
      </div>
      
      <div className={styles.contentCard}>
        {/* Placeholder content */}
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-4h4v-2h-4V7h-2v4H8v2h4z" fill="#E5E7EB"/>
            </svg>
          </div>
          <h3 className={styles.placeholderTitle}>{title}</h3>
          <p className={styles.placeholderText}>
            This section is under development and will be available soon.
          </p>
          <button className={styles.placeholderButton}>Coming Soon</button>
        </div>
      </div>
    </div>
  );
};

EventPageSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default EventPageSection;