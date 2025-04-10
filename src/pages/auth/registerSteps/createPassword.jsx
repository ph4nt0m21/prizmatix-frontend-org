// src/pages/auth/registerSteps/createPassword.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../authPages.module.scss';

/**
 * CreatePassword component - Step for creating and confirming password
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} CreatePassword component
 */
const CreatePassword = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading 
}) => {
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State to track if passwords match
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  // State to track if confirm password field has been touched
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  /**
   * Check if passwords match whenever password or confirmPassword changes
   */
  useEffect(() => {
    if (formData.confirmPassword) {
      setConfirmPasswordTouched(true);
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  /**
   * Handle the change event specifically for confirmPassword
   * @param {Event} e - Change event object
   */
  const handleConfirmPasswordChange = (e) => {
    handleChange(e);
    setConfirmPasswordTouched(true);
  };

  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.loginHeader}>
        <h1 className={styles.welcomeTitle}>Create a password</h1>
        <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
      </div>
      
      {/* Display any errors if they exist */}
      {(errors?.password || errors?.confirmPassword) && (
        <div className={styles.errorMessage}>
          {errors?.password || errors?.confirmPassword}
        </div>
      )}
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        {/* Password field */}
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.inputLabelModern}>
            Password
          </label>
          <div className={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={styles.modernInput}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <button 
              type="button" 
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,17 c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,7c2.76,0,5,2.24,5,5c0,0.65-0.13,1.26-0.36,1.83l2.92,2.92c1.51-1.26,2.7-2.89,3.43-4.75 c-1.73-4.39-6-7.5-11-7.5c-1.4,0-2.74,0.25-3.98,0.7l2.16,2.16C10.74,7.13,11.35,7,12,7z M2,4.27l2.28,2.28l0.46,0.46 C3.08,8.3,1.78,10.02,1,12c1.73,4.39,6,7.5,11,7.5c1.55,0,3.03-0.3,4.38-0.84l0.42,0.42L19.73,22L21,20.73L3.27,3L2,4.27z M7.53,9.8l1.55,1.55c-0.05,0.21-0.08,0.43-0.08,0.65c0,1.66,1.34,3,3,3c0.22,0,0.44-0.03,0.65-0.08l1.55,1.55 c-0.67,0.33-1.41,0.53-2.2,0.53c-2.76,0-5-2.24-5-5C7,11.21,7.2,10.47,7.53,9.8z M11.84,9.02l3.15,3.15l0.02-0.16 c0-1.66-1.34-3-3-3L11.84,9.02z"/>
                </svg>
              )}
            </button>
          </div>
          {errors?.password && (
            <span className={styles.errorText}>{errors.password}</span>
          )}
        </div>
        
        {/* Confirm Password field */}
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.inputLabelModern}>
            Re-Enter Password
          </label>
          <div className={styles.inputContainer}>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={styles.modernInput}
              placeholder="Enter your password"
              value={formData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
            />
            {/* Show check or x mark based on password match */}
            {confirmPasswordTouched && (
              <span className={styles.passwordValidation}>
                {passwordsMatch ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className={styles.passwordMatch}>
                    <path fill="#7c3aed" d="M9,16.17L4.83,12l-1.42,1.41L9,19L21,7l-1.41-1.41L9,16.17z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className={styles.passwordMismatch}>
                    <path fill="#e53e3e" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41z"/>
                  </svg>
                )}
              </span>
            )}
          </div>
          {errors?.confirmPassword && (
            <span className={styles.errorText}>{errors.confirmPassword}</span>
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

CreatePassword.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool
};

export default CreatePassword;