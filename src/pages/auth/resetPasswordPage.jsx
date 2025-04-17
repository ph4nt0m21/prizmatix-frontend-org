// src/pages/auth/resetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { ResetPasswordAPI } from '../../services/allApis';
import styles from "./authPages.module.scss";

/**
 * ResetPasswordPage component
 * Allows users to set a new password after receiving a reset link
 * 
 * @returns {JSX.Element} The ResetPasswordPage component
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const resetToken = queryParams.get('token');
  const email = queryParams.get('email');
  
  // Form state
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  // Check if token is valid on component mount
  useEffect(() => {
    if (!resetToken || !email) {
      setTokenValid(false);
      setError({
        message: "Invalid or expired password reset link. Please request a new one.",
        type: "error"
      });
    }
    
    // Verify token validity with backend (optional)
    // This could be implemented by calling a verify token API
    
    // Clear messages when component unmounts
    return () => {
      setError(null);
      setSuccessMessage("");
    };
  }, [resetToken, email]);
  
  /**
   * Shows error message in UI
   * @param {string} message - Error message to display
   * @param {string} type - Type of error (error, warning, info)
   */
  const showError = (message, type = "error") => {
    setError({ message, type });
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  /**
   * Handle form field changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { password, confirmPassword } = formData;
    
    // Form validation
    if (!password) {
      showError("Please enter a new password", "warning");
      return;
    }
    
    if (password.length < 8) {
      showError("Password must be at least 8 characters long", "warning");
      return;
    }
    
    if (password !== confirmPassword) {
      showError("Passwords do not match", "warning");
      return;
    }
    
    // Clear previous messages
    setError(null);
    setSuccessMessage("");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call reset password API
      // For now, simulate API call with timeout
      setTimeout(() => {
        // Here you would normally call the API:
        // const response = await ResetPasswordAPI({
        //   token: resetToken,
        //   email,
        //   password
        // });
        
        // Set success message
        setSuccessMessage("Password has been reset successfully. You can now login with your new password.");
        
        // Clear form
        setFormData({
          password: "",
          confirmPassword: ""
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error("Password reset failed:", error);
      
      // Extract error message from response
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError("Failed to reset password. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Render error message if exists
  const renderErrorMessage = () => {
    if (!error) return null;
    
    const className = styles.errorMessage + 
      (error.type === "warning" ? ` ${styles.warningMessage}` : '');
    
    return <div className={className}>{error.message}</div>;
  };
  
  // Render success message if exists
  const renderSuccessMessage = () => {
    if (!successMessage) return null;
    
    return <div className={styles.infoMessage}>{successMessage}</div>;
  };
  
  // If token is invalid, show error message and link to request new reset
  if (!tokenValid) {
    return (
      <div className={styles.modernAuthContainer}>
        <div className={styles.leftPanel}>
          <img 
            src="/images/auth-bg.png" 
            alt="Background" 
            className={styles.backgroundImage} 
          />
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.topBar}>
            <div className={styles.logoContainer}>
              <img 
                src="/images/logo.svg" 
                alt="PRIZMATIX" 
                className={styles.logo} 
              />
            </div>
          </div>
          
          <div className={styles.loginFormContainer}>
            <div className={styles.loginHeader}>
              <h1 className={styles.welcomeTitle}>Reset Password</h1>
            </div>
            
            {renderErrorMessage()}
            
            <div className={styles.loginForm}>
              <p className={styles.welcomeSubtitle}>
                The password reset link is invalid or has expired. 
                Please request a new one.
              </p>
              
              <button
                type="button"
                className={styles.signInButton}
                onClick={() => navigate("/forgot-password")}
              >
                Request New Reset Link
              </button>
              
              <div className={styles.signupPrompt}>
                <button 
                  type="button" 
                  className={styles.purpleLink}
                  onClick={() => navigate("/login")}
                >
                  Return to Login
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.footerContainer}>
            <p className={styles.copyrightText}>Copyright© 2025 PRIZMATIX</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.modernAuthContainer}>
      {/* Left side - background image */}
      <div className={styles.leftPanel}>
        <img 
          src="/images/auth-bg.png" 
          alt="Background" 
          className={styles.backgroundImage} 
        />
      </div>
      
      {/* Right side - reset password form */}
      <div className={styles.rightPanel}>
        <div className={styles.topBar}>
          <div className={styles.logoContainer}>
            <img 
              src="/images/logo.svg" 
              alt="PRIZMATIX" 
              className={styles.logo} 
            />
          </div>
        </div>
        
        <div className={styles.loginFormContainer}>
          <div className={styles.loginHeader}>
            <h1 className={styles.welcomeTitle}>Reset Password</h1>
            <p className={styles.welcomeSubtitle}>
              Please enter your new password below.
            </p>
          </div>
          
          {renderErrorMessage()}
          {renderSuccessMessage()}
          
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputLabelModern}>
                New Password
              </label>
              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10 C20,8.9,19.1,8,18,8z M9,6c0-1.66,1.34-3,3-3s3,1.34,3,3v2H9V6z M18,20H6V10h12V20z M12,17c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S10.9,17,12,17z"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={styles.modernInput}
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
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
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabelModern}>
                Confirm New Password
              </label>
              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10 C20,8.9,19.1,8,18,8z M9,6c0-1.66,1.34-3,3-3s3,1.34,3,3v2H9V6z M18,20H6V10h12V20z M12,17c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S10.9,17,12,17z"/>
                  </svg>
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={styles.modernInput}
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className={styles.passwordRequirements}>
              <ul className={styles.requirementList}>
                <li className={`${styles.requirementItem} ${formData.password.length >= 8 ? styles.validRequirement : styles.invalidRequirement}`}>
                  <span className={styles.requirementIcon}>
                    {formData.password.length >= 8 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    )}
                  </span>
                  At least 8 characters
                </li>
                <li className={`${styles.requirementItem} ${/[A-Z]/.test(formData.password) ? styles.validRequirement : styles.invalidRequirement}`}>
                  <span className={styles.requirementIcon}>
                    {/[A-Z]/.test(formData.password) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    )}
                  </span>
                  At least 1 uppercase letter
                </li>
                <li className={`${styles.requirementItem} ${/[0-9]/.test(formData.password) ? styles.validRequirement : styles.invalidRequirement}`}>
                  <span className={styles.requirementIcon}>
                    {/[0-9]/.test(formData.password) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    )}
                  </span>
                  At least 1 number
                </li>
                <li className={`${styles.requirementItem} ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? styles.validRequirement : styles.invalidRequirement}`}>
                  <span className={styles.requirementIcon}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    )}
                  </span>
                  At least 1 special character
                </li>
              </ul>
            </div>
            
            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.buttonSpinner}></span>
              ) : (
                "Reset Password"
              )}
            </button>
            
            <div className={styles.signupPrompt}>
              Remember your password? <button 
                type="button" 
                className={styles.signupLink}
                onClick={() => navigate("/login")}
              >
                Return to Login
              </button>
            </div>
          </form>
        </div>
        
        <div className={styles.footerContainer}>
          <p className={styles.copyrightText}>Copyright© 2025 PRIZMATIX</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;