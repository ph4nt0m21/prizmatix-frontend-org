// src/pages/auth/registerSteps/Step2AccountDetails.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/button/button';
import { Link } from 'react-router-dom';
import styles from '../authPages.module.scss';

/**
 * Step2AccountDetails component - Second step of the registration process
 * Collects personal information and account credentials
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.prevStep - Function to go back to previous step
 * @param {Function} props.handleSubmit - Function to submit the form
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.serverError - Server error message
 * @returns {JSX.Element} Step2AccountDetails component
 */
const Step2AccountDetails = ({ 
  formData, 
  handleChange, 
  prevStep, 
  handleSubmit, 
  errors, 
  isLoading,
  serverError
}) => {
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };
  
  // Password strength indicators
  const getPasswordStrength = (password) => {
    if (!password) return { text: '', color: '' };
    
    if (password.length < 8) {
      return { text: 'Weak', color: '#e74c3c' };
    }
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const score = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score === 4) {
      return { text: 'Strong', color: '#27ae60' };
    } else if (score >= 2) {
      return { text: 'Medium', color: '#f39c12' };
    } else {
      return { text: 'Weak', color: '#e74c3c' };
    }
  };
  
  const passwordStrength = getPasswordStrength(formData.password);
  
  return (
    <>
      <h1 className={styles.authTitle}>Create Account</h1>
      <p className={styles.authSubtitle}>Set up your personal details</p>
      
      {serverError && (
        <div className={styles.errorMessage}>{serverError}</div>
      )}
      
      <form className={styles.authForm} onSubmit={onSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.inputLabel}>
              First Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.firstName && (
              <span className={styles.errorText}>{errors.firstName}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.inputLabel}>
              Last Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.lastName && (
              <span className={styles.errorText}>{errors.lastName}</span>
            )}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="mobileNumber" className={styles.inputLabel}>
            Mobile Number <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            className={`${styles.input} ${errors.mobileNumber ? styles.inputError : ''}`}
            placeholder="Enter your mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.mobileNumber && (
            <span className={styles.errorText}>{errors.mobileNumber}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.inputLabel}>
            Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {formData.password && (
            <div className={styles.passwordStrength}>
              <span className={styles.strengthLabel}>Password Strength:</span>
              <span 
                className={styles.strengthIndicator} 
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.text}
              </span>
            </div>
          )}
          {errors.password && (
            <span className={styles.errorText}>{errors.password}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.inputLabel}>
            Confirm Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className={styles.errorText}>{errors.confirmPassword}</span>
          )}
        </div>
        
        {/* <div className={styles.formGroup}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={isLoading}
              className={styles.checkbox}
            />
            <label htmlFor="agreeToTerms" className={styles.checkboxLabel}>
              I agree to the <Link to="/terms" className={styles.link}>Terms of Service</Link> and <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <span className={styles.errorText}>{errors.agreeToTerms}</span>
          )}
        </div> */}
        
        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="outline"
            size="large"
            onClick={prevStep}
            disabled={isLoading}
            className={styles.backButton}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isLoading}
            className={styles.createAccountButton}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
      
      <div className={styles.authFooter}>
        <p>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
};

Step2AccountDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  serverError: PropTypes.string
};

export default Step2AccountDetails;