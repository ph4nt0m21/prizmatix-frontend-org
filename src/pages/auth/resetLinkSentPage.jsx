import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

// Import styling from the login page for consistent design
import styles from "./loginPage.module.scss";

// Import SVG components
import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/arrow-icon.svg";

// Import images
import wallpaperBg from "../../assets/images/auth-bg.jpg"; // Re-using login page background
import logoImage from "../../assets/images/logo.svg";

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

  // Get email from state passed by the ForgotPasswordPage (not used in current UI but good to keep)
  const email = location.state?.email || "your email";

  // Handle return to login
  const handleReturnToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.loginPanel}> {/* Re-using loginPanel class */}
      {/* Left Panel with background */}
      <div className={styles.leftPanel}> {/* Re-using leftPanel class */}
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} /> {/* Re-using wallpaper class */}
      </div>

      {/* Right Panel with content */}
      <div className={styles.rightPanel}> {/* Re-using rightPanel class */}
        <div className={styles.header}> {/* Re-using header class */}
          {/* Back button/link as seen in the image */}
          <Link to="/login" className={styles.backButton} aria-label="Return to Login">
            <ArrowIcon className={styles.backIcon} />
            <span className={styles.backButtonText}>Return to Login</span> {/* New span for text */}
          </Link>
          <div className={styles.logoContainer}> {/* Re-using logoContainer class */}
            <img src={logoImage} alt="Prizmatix Logo" className={styles.logo} /> {/* Re-using logo class */}
          </div>
        </div>

        <div className={styles.formContainer}> {/* Re-using formContainer class for centering content */}
          <div className={styles.welcomeSection}> {/* Re-using welcomeSection for consistent spacing */}
            {/* Email Icon - centered and styled */}
            <div className={styles.emailIconContainer} style={{ marginBottom: '20px' }}>
              <MailIcon style={{ width: '48px', height: '48px', color: '#7c3aed' }} />
            </div>

            <h1 className={styles.welcomeTitle}>Email on the way!</h1>
            <p className={styles.welcomeSubtitle}>
              We sent you password reset instructions. If it doesn't show up soon, please check your spam folder. We sent it from the email <span className={styles.companyName}>no-reply@prizmatix.com</span>
            </p>
          </div>

          {/* Return to Login Button */}
          <button
            type="button"
            className={styles.signInButton}
            onClick={handleReturnToLogin}
          >
            Return to Login
          </button>
        </div>

        <div className={styles.footer}> {/* Re-using footer class */}
          <p className={styles.copyright}> {/* Re-using copyright class */}
            Copyright © 2025 <span className={styles.companyName}>Prizmatix</span> {/* Re-using companyName class */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetLinkSentPage;