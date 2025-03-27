// src/pages/notFound/notFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/button/button';
import styles from './notFoundPage.module.scss';

/**
 * NotFoundPage component displayed when a route doesn't exist
 * Provides a user-friendly 404 error page with navigation back to home
 * 
 * @returns {JSX.Element} The NotFoundPage component
 */
const NotFoundPage = () => {
  const navigate = useNavigate();
  
  /**
   * Navigate back to the home page
   */
  const handleGoHome = () => {
    navigate('/');
  };
  
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className={styles.actions}>
          <Button 
            variant="primary"
            size="medium"
            onClick={handleGoHome}
            className={styles.homeButton}
          >
            Back to Home
          </Button>
        </div>
      </div>
      
      <div className={styles.decoration}>
        <div className={styles.circle}></div>
        <div className={styles.square}></div>
        <div className={styles.triangle}></div>
      </div>
    </div>
  );
};

export default NotFoundPage;