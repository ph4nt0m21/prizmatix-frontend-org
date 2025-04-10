// src/pages/auth/registerSteps/basicDetails.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from '../authPages.module.scss';

/**
 * BasicDetails component - Initial step of the registration process
 * Collects basic user information like name, phone, and email
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} BasicDetails component
 */
const BasicDetails = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading 
}) => {
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.loginHeader}>
        <h1 className={styles.welcomeTitle}>Let's start with your basic details</h1>
        <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
      </div>
      
      {/* Display any errors if they exist */}
      {(errors?.firstName || errors?.lastName || errors?.mobileNumber || errors?.email) && (
        <div className={styles.errorMessage}>
          {errors?.firstName || errors?.lastName || errors?.mobileNumber || errors?.email}
        </div>
      )}
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        {/* First Name and Last Name row */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.inputLabelModern}>
              First Name
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={styles.modernInput}
                placeholder="eg. John"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {errors?.firstName && (
              <span className={styles.errorText}>{errors.firstName}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.inputLabelModern}>
              Last Name
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={styles.modernInput}
                placeholder="eg. Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {errors?.lastName && (
              <span className={styles.errorText}>{errors.lastName}</span>
            )}
          </div>
        </div>
        
        {/* Phone Number */}
        <div className={styles.formGroup}>
          <label htmlFor="mobileNumber" className={styles.inputLabelModern}>
            Phone Number
          </label>
          <div className={styles.inputContainer}>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              className={styles.modernInput}
              placeholder="eg. 97364856**"
              value={formData.mobileNumber}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          {errors?.mobileNumber && (
            <span className={styles.errorText}>{errors.mobileNumber}</span>
          )}
        </div>
        
        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.inputLabelModern}>
            E-Mail
          </label>
          <div className={styles.inputContainer}>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.modernInput}
              placeholder="johndoe@gmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled={true} // Email is pre-filled and disabled since it was entered in previous step
            />
          </div>
          {errors?.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>
        
        {/* Next Button */}
        <button
          type="submit"
          className={styles.purpleButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.buttonSpinner}></span>
          ) : (
            "Next"
          )}
        </button>
      </form>
    </div>
  );
};

BasicDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool
};

export default BasicDetails;