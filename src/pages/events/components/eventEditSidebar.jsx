import React from 'react';
import PropTypes from 'prop-types';
import styles from './eventEditSidebar.module.scss';

// Import SVG components for icons
import { ReactComponent as BasicInfoIcon } from '../../../assets/icons/basic-info-icon.svg';
import { ReactComponent as LocationIcon } from '../../../assets/icons/location-icon.svg';
import { ReactComponent as DateIcon } from '../../../assets/icons/date-icon.svg';
import { ReactComponent as DescriptionIcon } from '../../../assets/icons/description-icon.svg';
import { ReactComponent as ArtIcon } from '../../../assets/icons/art-icon.svg';

/**
 * Sidebar for editing event — limited to core 5 steps.
 */
const EventEditSidebar = ({ currentStep, navigateToStep }) => {
  const steps = [
    { number: 1, label: 'Basic Info', icon: BasicInfoIcon },
    { number: 2, label: 'Location', icon: LocationIcon },
    { number: 3, label: 'Date & Time', icon: DateIcon },
    { number: 4, label: 'Description', icon: DescriptionIcon },
    { number: 5, label: 'Thumbnail & Banner', icon: ArtIcon }
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Edit Event</h2>
        <p className={styles.sidebarSubtitle}>Update your event details</p>
      </div>

      <div className={styles.stepsList}>
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          return (
            <div
              key={step.number}
              className={`${styles.step} ${isActive ? styles.active : ''}`}
              onClick={() => navigateToStep(step.number)}
            >
              <div className={styles.stepIconContainer}>
                <Icon className={styles.stepIcon} />
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.progressInfoContainer}>
        <div className={styles.progressText}>Step {currentStep} of {steps.length}</div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

EventEditSidebar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  navigateToStep: PropTypes.func.isRequired
};

export default EventEditSidebar;
