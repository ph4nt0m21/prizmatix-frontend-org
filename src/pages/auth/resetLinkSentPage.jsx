// src/pages/auth/resetLinkSentPage.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./authPages.module.scss";

/**
 * ResetLinkSentPage component
 * Shown after a user requests a password reset link
 * Confirms that reset instructions have been sent to their email
 * 
 * @returns {JSX.Element} The ResetLinkSentPage component
 */
const ResetLinkSentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from state passed by the ForgotPasswordPage
  const email = location.state?.email || "your email";
  
  // Handle return to login
  const handleReturnToLogin = () => {
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
      
      {/* Right side - success message */}
      <div className={styles.rightPanel}>
        <div className={styles.topBar}>
          <button 
            type="button" 
            className={styles.goBackButton}
            onClick={handleReturnToLogin}
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
          <div className={styles.emailSentContainer}>
            {/* Email Icon */}
            <div className={styles.emailIconContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>

            {/* Message */}
            <h1 className={styles.welcomeTitle}>Email on the way!</h1>
            <p className={styles.resetInstructions}>
              We sent you password reset instructions. If it doesn't show up soon, please check your spam folder or email <span className={styles.emailHighlight}>no-reply@prizmatix.com</span>
            </p>
            
            {/* Return to Login Button */}
            <button
              type="button"
              className={styles.signInButton}
              onClick={handleReturnToLogin}
            >
              Return to Login
            </button>
          </div>
        </div>
        
        <div className={styles.footerContainer}>
          <p className={styles.copyrightText}>Copyright© 2025 Prizmatix</p>
        </div>
      </div>
    </div>
  );
};

export default ResetLinkSentPage;