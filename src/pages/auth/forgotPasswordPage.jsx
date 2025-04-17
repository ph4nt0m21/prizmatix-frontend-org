// src/pages/auth/forgotPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { ForgotPasswordAPI } from '../../services/allApis';
import styles from "./authPages.module.scss";

/**
 * ForgotPasswordPage component
 * Allows users to request a password reset link via email
 * 
 * @returns {JSX.Element} The ForgotPasswordPage component
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get('token');
      if (token) {
        // Redirect to home if token exists
        navigate("/", { replace: true });
      }
    };
    
    checkToken();
    
    // Clear messages when component unmounts
    return () => {
      setError(null);
      setSuccessMessage("");
    };
  }, [navigate]);
  
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
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email) {
      showError("Please enter your email address", "warning");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      showError("Please enter a valid email address", "warning");
      return;
    }
    
    // Clear previous errors
    setError(null);
    setSuccessMessage("");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call forgot password API
      // For now, simulate API call with timeout
      setTimeout(() => {
        // Here you would normally call the API:
        // const response = await ForgotPasswordAPI({ email });
        
        // Instead of showing success message, navigate to the reset link sent page
        navigate("/reset-link-sent", { state: { email } });
        
      }, 1500);
    } catch (error) {
      console.error("Forgot password request failed:", error);
      
      // Extract error message from response
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError("Failed to send reset link. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
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

  // Handle going back to login
  const handleGoBack = () => {
    navigate("/login");
  };
  
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
      
      {/* Right side - forgot password form */}
      <div className={styles.rightPanel}>
        <div className={styles.topBar}>
          <button 
            type="button" 
            className={styles.goBackButton}
            onClick={handleGoBack}
          >
            ‹
          </button>
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
            <h1 className={styles.welcomeTitle}>Forgot password?</h1>
            <p className={styles.welcomeSubtitle}>
              Don't worry. Enter your account's email address and 
              we'll send you a link to reset your password.
            </p>
          </div>
          
          {renderErrorMessage()}
          {renderSuccessMessage()}
          
          <form className={styles.loginForm} onSubmit={handleSubmit}>
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
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                "Send reset link"
              )}
            </button>
            
            <div className={styles.signupPrompt}>
              Remember your password? <Link to="/login" className={styles.signupLink}>Return to Login</Link>
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

export default ForgotPasswordPage;