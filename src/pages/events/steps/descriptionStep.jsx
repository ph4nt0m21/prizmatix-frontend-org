import React from 'react';
import styles from './steps.module.scss';

const DescriptionStep = () => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Description</h2>
        <p className={styles.stepDescription}>This step will be implemented later</p>
      </div>
    </div>
  );
};

export default DescriptionStep;