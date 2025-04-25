import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import styles from './emailVerification.module.scss';

// Import SVG components
import { ReactComponent as MailIcon } from "../../../assets/icons/mail-icon.svg";
import { ReactComponent as ArrowIcon } from "../../../assets/icons/arrow-icon.svg";
import { ReactComponent as EyeIcon } from "../../../assets/icons/eye-icon.svg";
import { ReactComponent as EyeOffIcon } from "../../../assets/icons/eye-off-icon.svg";

// Import images
import wallpaperBg from "../../../assets/images/register1-bg.png";
import logoImage from "../../../assets/images/logo.svg";
import emojiSparkles from "../../../assets/images/emoji-sparkles_.svg";

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
 * @param {string} props.verificationStep - Current verification sub-step
 * @param {Function} props.setVerificationStep - Function to set verification sub-step
 * @param {Function} props.verifyEmail - Function to verify email
 * @param {Function} props.onGoBack - Function to handle going back
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
  verifyEmail,
  onGoBack
}) => {
  const navigate = useNavigate();
  
  // State for verification code inputs
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(59);
  const [timerActive, setTimerActive] = useState(false);
  
  // Focus first input on mount when showing verification step
  useEffect(() => {
    if (verificationStep === 'code-verification' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      setTimerActive(true);
    }
  }, [verificationStep]);
  
  // Handle timer countdown
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timerActive, timeLeft]);
  
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
    // Only allow resend when timer is not active
    if (timerActive) return;
    
    // Clear the current code
    setVerificationCode(['', '', '', '', '', '']);
    
    // Reset and start the timer
    setTimeLeft(59);
    setTimerActive(true);
    
    // Simulated API call to resend code
    verifyEmail();
    
    // Focus the first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };
  
  // Format timer display
  const formatTime = (seconds) => {
    return `00:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  // Render error message if exists
  const renderErrorMessage = () => {
    if (!errors || !errors.email) return null;
    
    return <div className={styles.errorMessage}>{errors.email}</div>;
  };
  
  // Handle going back
  const handleGoBack = () => {
    if (verificationStep === 'code-verification') {
      setVerificationStep('email-entry');
    } else {
      onGoBack ? onGoBack() : navigate('/login');
    }
  };
  
  // Email verification form content
  const renderEmailEntryForm = () => (
    <>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Create Account <img src={emojiSparkles} alt="✨" className={styles.sparkleIcon} />
        </h1>
        <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
      </div>
      
      {renderErrorMessage()}
      
      <form onSubmit={handleEmailSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.inputField}>
            <MailIcon className={styles.fieldIcon} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-label="Email Address"
            />
          </div>
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
      
      <div className={styles.signupPrompt}>
        Already have an account? <Link to="/login" className={styles.signupLink}>Login</Link>
      </div>
    </>
  );
  
  // Verification code form content
  const renderVerificationForm = () => (
    <>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Email Verification <img src={emojiSparkles} alt="✨" className={styles.sparkleIcon} />
        </h1>
        <p className={styles.welcomeSubtitle}>
          Enter the 6-digit verification code sent to<br />
          <strong className={styles.emailHighlight}>{formData.email}</strong>
        </p>
      </div>
      
      {renderErrorMessage()}
      
      <div className={styles.form}>
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
              aria-label={`Verification code digit ${index + 1}`}
            />
          ))}
        </div>
        
        <div className={styles.resendCodeContainer}>
          <button 
            type="button" 
            className={styles.resendCodeButton}
            onClick={resendCode}
            disabled={isLoading || timerActive}
          >
            Resend Code {timerActive && (
              <span className={styles.timer}>{formatTime(timeLeft)}</span>
            )}
          </button>
        </div>
        
        <button
          type="button"
          className={styles.signInButton}
          onClick={nextStep}
          disabled={isLoading || verificationCode.includes('')}
        >
          {isLoading ? (
            <div className={styles.spinner}></div>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </>
  );
  
  return (
    <div className={styles.loginPanel}>
      {/* Left Panel with dark background */}
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
        <div className={styles.leftPanelContent}>
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
        {/* Header with back button and logo */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
            aria-label="Go back"
          >
            <ArrowIcon className={styles.backIcon} />
          </button>
          <div className={styles.logoContainer}>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.logo} />
          </div>
        </div>
        
        {/* Main content with form */}
        <div className={styles.formContainer}>
          {verificationStep === 'email-entry' 
            ? renderEmailEntryForm() 
            : renderVerificationForm()
          }
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

EmailVerification.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  verificationStep: PropTypes.string.isRequired,
  setVerificationStep: PropTypes.func.isRequired,
  verifyEmail: PropTypes.func.isRequired,
  onGoBack: PropTypes.func
};

export default EmailVerification;