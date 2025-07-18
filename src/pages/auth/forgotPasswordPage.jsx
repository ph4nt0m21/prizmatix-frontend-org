import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { ForgotPasswordAPI } from '../../services/allApis'; // Assuming this path is correct

// Import styling from the login page for consistent design
import styles from "./loginPage.module.scss";

// Import SVG components
import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/arrow-icon.svg";

// Import images
import wallpaperBg from "../../assets/images/auth-bg.jpg"; // Re-using login page background
import logoImage from "../../assets/images/logo.svg";

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
  const [successMessage, setSuccessMessage] = useState(""); // Keeping for potential future use, though not in image

  // Check if user is already authenticated (re-using logic from original)
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
    setSuccessMessage(""); // Clear success message on new submission

    // Set loading state
    setIsLoading(true);

    try {
      // Simulate API call with timeout as per original code
      setTimeout(() => {
        // In a real application, you would call:
        // const response = await ForgotPasswordAPI({ email });

        // Navigate to the reset link sent page on simulated success
        navigate("/reset-link-sent", { state: { email } });

      }, 1500);
    } catch (err) {
      console.error("Forgot password request failed:", err);

      // Extract error message from response
      const errorMessage = err.response?.data?.message || "Failed to send reset link. Please try again later.";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render error message if exists
  const renderErrorMessage = () => {
    if (!error) return null;

    const className = `${styles.errorMessage} ${error.type === "warning" ? styles.warningMessage : ''}`;
    return <div className={className}>{error.message}</div>;
  };

  // Render success message if exists (not used in current UI but kept for functionality)
  const renderSuccessMessage = () => {
    if (!successMessage) return null;
    return <div className={styles.infoMessage}>{successMessage}</div>; // Assuming infoMessage style exists
  };

  return (
    <div className={styles.loginPanel}> {/* Re-using loginPanel class */}
      {/* Left Panel with background */}
      <div className={styles.leftPanel}> {/* Re-using leftPanel class */}
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} /> {/* Re-using wallpaper class */}
      </div>

      {/* Right Panel with form */}
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

        <div className={styles.formContainer}> {/* Re-using formContainer class */}
          <div className={styles.welcomeSection}> {/* Re-using welcomeSection class */}
            <h1 className={styles.welcomeTitle}>Forgot password?</h1>
            <p className={styles.welcomeSubtitle}>
              Don't worry. Enter your account's email address and we'll send you a link to reset your password.
            </p>
          </div>

          {renderErrorMessage()}
          {renderSuccessMessage()} {/* Still render if successMessage is set */}

          <form onSubmit={handleSubmit} className={styles.form}> {/* Re-using form class */}
            <div className={styles.inputGroup}> {/* Re-using inputGroup class */}
              <div className={styles.inputField}> {/* Re-using inputField class */}
                <MailIcon className={styles.fieldIcon} /> {/* Re-using fieldIcon class */}
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
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
              {isLoading ? <div className={styles.spinner}></div> : "Send reset link"} {/* Re-using spinner class */}
            </button>
          </form>

          <div className={styles.signupPrompt}> {/* Re-using signupPrompt class */}
            Remember your password? <Link to="/login" className={styles.signupLink}>Return to Login</Link> {/* Re-using signupLink class */}
          </div>
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

export default ForgotPasswordPage;