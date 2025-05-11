import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './createPassword.module.scss';

// Import SVG components
import { ReactComponent as ArrowIcon } from "../../../assets/icons/arrow-icon.svg";

// Import images
import wallpaperBg from "../../../assets/images/register2-bg.png";
import logoImage from "../../../assets/images/logo2.svg";
import emojiSparkles from "../../../assets/images/emoji-sparkles_.svg";

/**
 * CreatePassword component - Third step of the registration process
 * Collects password information with validation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onGoBack - Function to handle going back
 * @returns {JSX.Element} CreatePassword component
 */
const CreatePassword = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading,
  onGoBack
}) => {
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // State to track if passwords match
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  
  // State to track if confirm password field has been touched
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Add this new state to track if the password field has been focused
const [passwordFieldFocused, setPasswordFieldFocused] = useState(false);

// Add these handlers for the password field
const handlePasswordFocus = () => {
  setPasswordFieldFocused(true);
};

const handlePasswordBlur = () => {
  // Optional: You could set it back to false when empty
  // Only uncomment this if you want the requirements to disappear when the field is empty and loses focus
  if (!formData.password) {
    setPasswordFieldFocused(false);
  }
};

  /**
   * Check password validation whenever password changes
   */
  useEffect(() => {
    const password = formData.password || '';
    
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
    
    // Check if passwords match
    if (formData.confirmPassword) {
      setPasswordsMatch(password === formData.confirmPassword);
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
  
  // Render error message if exists
  const renderErrorMessage = () => {
    if (!errors || (!errors.password && !errors.confirmPassword)) {
      return null;
    }
    
    const errorMessage = errors?.password || errors?.confirmPassword;
    return <div className={styles.errorMessage}>{errorMessage}</div>;
  };

  // Determine if form is valid for submission
  const isFormValid = 
    passwordValidation.length && 
    passwordValidation.uppercase && 
    passwordValidation.lowercase && 
    passwordValidation.number && 
    passwordValidation.special && 
    passwordsMatch;

  return (
    <div className={styles.loginPanel}>
      {/* Left Panel with dark background */}
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
        <div className={styles.leftPanelContent}>
          <div>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.leftLogo} />
          </div>
        </div>
      </div>

      {/* Right Panel with form */}
      <div className={styles.rightPanel}>
        {/* Header with back button and steps indicator */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={onGoBack}
            aria-label="Go back"
          >
            <ArrowIcon className={styles.backIcon} />
          </button>
          
          {/* Step indicator - showing second step active */}
          <div className={styles.stepsIndicator}>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.active}`}></div>
            <div className={styles.step}></div>
            <div className={styles.step}></div>
          </div>
          
          <div className={styles.emptySpace}></div>
        </div>
        
        {/* Main content with form */}
        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Create a password
            </h1>
            <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
          </div>
          
          {renderErrorMessage()}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Password field */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className={styles.iconButton}
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              
              {/* Password validation requirements - only show when field is focused */}
              {passwordFieldFocused && (
                <div className={styles.passwordRequirements}>
                  <div className={styles.requirementItem}>
                    <svg className={`${styles.checkIcon} ${passwordValidation.length ? styles.validIcon : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={passwordValidation.length ? styles.validText : ''}>
                      Must be at least 8 characters
                    </span>
                  </div>
                  <div className={styles.requirementItem}>
                    <svg className={`${styles.checkIcon} ${passwordValidation.lowercase ? styles.validIcon : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={passwordValidation.lowercase ? styles.validText : ''}>
                      One lowercase character
                    </span>
                  </div>
                  <div className={styles.requirementItem}>
                    <svg className={`${styles.checkIcon} ${passwordValidation.uppercase ? styles.validIcon : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={passwordValidation.uppercase ? styles.validText : ''}>
                      One uppercase character
                    </span>
                  </div>
                  <div className={styles.requirementItem}>
                    <svg className={`${styles.checkIcon} ${passwordValidation.special ? styles.validIcon : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={passwordValidation.special ? styles.validText : ''}>
                      One special character
                    </span>
                  </div>
                  <div className={styles.requirementItem}>
                    <svg className={`${styles.checkIcon} ${passwordValidation.number ? styles.validIcon : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={passwordValidation.number ? styles.validText : ''}>
                      One number
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Re-Enter Password field - NO EYE ICON */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                Re-Enter Password
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isLoading}
                />
                
                {/* Show only check mark when passwords match */}
                {confirmPasswordTouched && passwordsMatch && (
                  <span className={styles.validationIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className={styles.matchIcon}>
                      <path fill="#7c3aed" d="M9,16.17L4.83,12l-1.42,1.41L9,19L21,7l-1.41-1.41L9,16.17z"/>
                    </svg>
                  </span>
                )}
              </div>
              {errors?.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword}</span>
              )}
            </div>
            
            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading || !isFormValid}
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

CreatePassword.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  onGoBack: PropTypes.func.isRequired
};

export default CreatePassword;