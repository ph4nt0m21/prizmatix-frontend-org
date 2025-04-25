import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './basicDetails.module.scss';

// Import SVG components
import { ReactComponent as ArrowIcon } from "../../../assets/icons/arrow-icon.svg";

// Import images
import wallpaperBg from "../../../assets/images/register1-bg.png";
import logoImage from "../../../assets/images/logo.svg";
import emojiSparkles from "../../../assets/images/emoji-sparkles_.svg";

/**
 * BasicDetails component - Second step of the registration process
 * Collects basic user information like name, phone, and email
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onGoBack - Function to handle going back
 * @returns {JSX.Element} BasicDetails component
 */
const BasicDetails = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading,
  onGoBack
}) => {
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  // Render error message if exists
  const renderErrorMessage = () => {
    if (!errors || (!errors.firstName && !errors.lastName && !errors.mobileNumber)) {
      return null;
    }
    
    const errorMessage = errors?.firstName || errors?.lastName || errors?.mobileNumber;
    return <div className={styles.errorMessage}>{errorMessage}</div>;
  };

  return (
    <div className={styles.loginPanel}>
      {/* Left Panel with dark background */}
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
        <div className={styles.leftPanelContent}>
          <div className={styles.leftPanelLogo}>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.leftLogo} />
          </div>
          <div className={styles.leftPanelText}>
            <h2 className={styles.leftPanelHeading}>
              <span className={styles.purpleText}>Sell</span> Tickets.
            </h2>
            <h2 className={styles.leftPanelHeading}>
              <span className={styles.purpleText}>Fill</span> Seats.
            </h2>
            <h2 className={styles.leftPanelHeading}>
              <span className={styles.purpleText}>Get</span> Paid.
            </h2>
          </div>
        </div>
      </div>

      {/* Right Panel with form */}
      <div className={styles.rightPanel}>
        {/* Header with back button, steps indicator, and logo */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={onGoBack}
            aria-label="Go back"
          >
            <ArrowIcon className={styles.backIcon} />
          </button>
          
          {/* Step indicator */}
          <div className={styles.stepsIndicator}>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.active}`}></div>
            <div className={styles.step}></div>
            <div className={styles.step}></div>
          </div>
          
          <div className={styles.logoContainer}>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.logo} />
          </div>
        </div>
        
        {/* Main content with form */}
        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Let's start with your basic details
            </h1>
            <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
          </div>
          
          {renderErrorMessage()}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* First Name and Last Name row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.inputLabel}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={styles.input}
                  placeholder="eg. John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors?.firstName && (
                  <span className={styles.fieldError}>{errors.firstName}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.inputLabel}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={styles.input}
                  placeholder="eg. Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors?.lastName && (
                  <span className={styles.fieldError}>{errors.lastName}</span>
                )}
              </div>
            </div>
            
            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label htmlFor="mobileNumber" className={styles.inputLabel}>
                Phone Number
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                className={styles.input}
                placeholder="eg. 97364856**"
                value={formData.mobileNumber}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors?.mobileNumber && (
                <span className={styles.fieldError}>{errors.mobileNumber}</span>
              )}
            </div>
            
            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`${styles.input} ${styles.disabledInput}`}
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={true} // Email is pre-filled and disabled since it was entered in previous step
              />
            </div>
            
            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                "Next"
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.copyright}>
            Copyright © 2025 <span className={styles.companyName}>Prizmatix</span>
          </p>
        </div>
      </div>
    </div>
  );
};

BasicDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  onGoBack: PropTypes.func.isRequired
};

export default BasicDetails;