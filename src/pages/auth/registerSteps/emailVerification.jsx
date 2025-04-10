// src/pages/auth/registerSteps/EmailVerification.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from '../authPages.module.scss';

/**
 * EmailVerification component - Initial step of the registration process
 * Collects and verifies email address
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} EmailVerification component
 */
const EmailVerification = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading,
  verificationStep,
  setVerificationStep,
  verifyEmail
}) => {
  // State for verification code inputs
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  
  // Focus first input on mount when showing verification step
  useEffect(() => {
    if (verificationStep === 'code-verification' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [verificationStep]);
  
  /**
   * Handle form submission for email entry
   * @param {Event} e - Form submission event
   */
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    verifyEmail();
  };
  
  /**
   * Handle verification code input changes
   * @param {number} index - Index of the input field
   * @param {Event} e - Change event
   */
  const handleCodeChange = (index, e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      return;
    }
    
    // Update the verification code array
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value.slice(0, 1); // Only take the first character
    setVerificationCode(newVerificationCode);
    
    // Auto-focus to next input if a digit was entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
    
    // Check if all fields are filled to auto-submit
    if (newVerificationCode.every(digit => digit) && !newVerificationCode.includes('')) {
      // Call verification logic here
      setTimeout(() => {
        nextStep();
      }, 500);
    }
  };
  
  /**
   * Handle key down events for code input
   * @param {number} index - Index of the input field
   * @param {Event} e - KeyDown event
   */
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0 && inputRefs.current[index - 1]) {
        // If current field is empty and backspace is pressed, focus previous field
        inputRefs.current[index - 1].focus();
      }
    }
    
    // Handle paste event
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedData = text.trim().slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
          const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
          setVerificationCode(newCode);
          
          // Focus the next empty field or the last field
          const nextEmptyIndex = newCode.findIndex(digit => !digit);
          if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
            inputRefs.current[nextEmptyIndex].focus();
          } else if (inputRefs.current[5]) {
            inputRefs.current[5].focus();
          }
        }
      });
    }
  };
  
  /**
   * Handle paste event for code input
   * @param {Event} e - Paste event
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setVerificationCode(newCode);
      
      // Focus the next empty field or the last field
      const nextEmptyIndex = newCode.findIndex(digit => !digit);
      if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex].focus();
      } else if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };
  
  /**
   * Resend verification code
   */
  const resendCode = () => {
    // Clear the current code
    setVerificationCode(['', '', '', '', '', '']);
    
    // Show resend message (this would trigger the actual resend in a real implementation)
    alert('Verification code resent!');
    
    // Focus the first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };
  
  // Render the appropriate step
  if (verificationStep === 'email-entry') {
    return (
      <div className={styles.loginFormContainer}>
        <div className={styles.loginHeader}>
          <h1 className={styles.welcomeTitle}>Create Account</h1>
          <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
        </div>
        
        {errors.email && (
          <div className={styles.errorMessage}>{errors.email}</div>
        )}
        
        <form className={styles.loginForm} onSubmit={handleEmailSubmit}>
          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,8l-8,5L4,8V6l8,5l8-5V8z"/>
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.modernInput}
                placeholder="eg. johndoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={styles.signInButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.buttonSpinner}></span>
            ) : (
              "Next"
            )}
          </button>
          
          <div className={styles.signupPrompt}>
            Already have an account? <Link to="/login" className={styles.signupLink}>Login</Link>
          </div>
        </form>
      </div>
    );
  } else {
    return (
      <div className={styles.loginFormContainer}>
        <div className={styles.loginHeader}>
          <h1 className={styles.welcomeTitle}>Email Verification</h1>
          <p className={styles.welcomeSubtitle}>
            Enter the 6-digit verification code sent to<br />
            <strong>{formData.email}</strong>
          </p>
        </div>
        
        <div className={styles.verificationContainer}>
          <div className={styles.codeInputGroup}>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                className={styles.codeInput}
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
              />
            ))}
          </div>
          
          <div className={styles.resendCodeContainer}>
            <button 
              type="button" 
              className={styles.resendCodeButton}
              onClick={resendCode}
              disabled={isLoading}
            >
              Resend Code in <span className={styles.timer}>00:59</span>
            </button>
          </div>
          
          <button
            type="button"
            className={styles.signInButton}
            onClick={nextStep}
            disabled={isLoading || verificationCode.includes('')}
          >
            {isLoading ? (
              <span className={styles.buttonSpinner}></span>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    );
  }
};

EmailVerification.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  verificationStep: PropTypes.string.isRequired,
  setVerificationStep: PropTypes.func.isRequired,
  verifyEmail: PropTypes.func.isRequired
};

export default EmailVerification;