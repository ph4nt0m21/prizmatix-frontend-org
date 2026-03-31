import React from 'react';
import PropTypes from 'prop-types';
import styles from './LeftStepper.module.scss';

// Image assets (replace with actual paths if needed)
const imgBasicInfo = "http://localhost:3845/assets/de88b6167262c165a9bb47a275cc8d324fa81d48.svg";
const imgLocation = "http://localhost:3845/assets/3a6b61bdfd5583424e0594fe27b4149b64332a12.svg";
const imgDate = "http://localhost:3845/assets/7ccf1033c7f2a3328800a9a72b93caa3a3fb985d.svg";
const imgDescription = "http://localhost:3845/assets/32930d11ee3eba33b94b49a21a74652d5161c00c.svg";
const imgArt = "http://localhost:3845/assets/61dc22a7dbfd7e191c3e4915d10990beb8f0e05e.svg";
const imgTickets = "http://localhost:3845/assets/18884143fbb5a0b62ed6a7aa8edad1674264c01d.svg";
const imgDiscount = "http://localhost:3845/assets/851b889610c67b25369a7e707b3ffb6bb76a754d.svg";
const imgPublish = "http://localhost:3845/assets/dc86b577c74ab75d8640b7fcd7af58c558e7b0b5.svg";

const steps = [
  { id: 1, label: 'Basic Info', icon: imgBasicInfo },
  { id: 2, label: 'Location', icon: imgLocation },
  { id: 3, label: 'Date', icon: imgDate },
  { id: 4, label: 'Description', icon: imgDescription },
  { id: 5, label: 'Art', icon: imgArt },
  { id: 6, label: 'Tickets', icon: imgTickets },
  { id: 7, label: 'Discount Codes', icon: imgDiscount },
  { id: 8, label: 'Publish', icon: imgPublish },
];

const LeftStepper = ({ currentStep }) => {
  return (
    <div className={styles.leftStepper} data-node-id="238:2599">
      <div className={styles.header}>
        <h2 className={styles.title}>Create Event</h2>
        <p className={styles.subtitle}>These are the steps for creating your event</p>
      </div>
      <ul className={styles.stepList}>
        {steps.map(step => (
          <li
            key={step.id}
            className={`${styles.stepItem} ${currentStep === step.id ? styles.active : ''}`}
          >
            <div className={styles.stepContent}>
              <img src={step.icon} alt={step.label} className={styles.icon} />
              <span className={styles.label}>{step.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

LeftStepper.propTypes = {
  currentStep: PropTypes.number.isRequired,
};

export default LeftStepper;
