import React from 'react';
import styles from './loadingSpinner.module.scss';

/**
 * LoadingSpinner component displays a loading indicator
 * Used for async operations, route transitions, and data fetching
 * 
 * @param {Object} props Component props
 * @param {string} [props.size='medium'] Spinner size (small, medium, large)
 * @param {string} [props.color='primary'] Spinner color (primary, secondary, light)
 * @param {boolean} [props.fullPage=false] Whether to display spinner centered on full page
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  fullPage = false
}) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[color]
  ].filter(Boolean).join(' ');
  
  const containerClasses = [
    styles.container,
    fullPage ? styles.fullPage : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;