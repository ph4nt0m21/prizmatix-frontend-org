import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import styles from "./loginPage.module.scss";

// Import SVG components
import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as LockIcon } from "../../assets/icons/lock-icon.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/arrow-icon.svg";

// --- EDITED FOR ICON FIX ---
// Import SVGs as files to be used in <img> tags
import eyeIcon from "../../assets/icons/eye-icon.svg";
import eyeOffIcon from "../../assets/icons/eye-off-icon.svg";

// Import images
import wallpaperBg from "../../assets/images/auth-bg.jpg";
import logoImage from "../../assets/images/logo.svg";
import emojiSparkles from "../../assets/images/emoji-sparkles_.svg";

/**
 * LoginPage component handles user authentication.
 * It uses the AuthContext for login logic and manages its own UI state.
 *
 * @returns {JSX.Element} The LoginPage component
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth(); // Use the login function and isAuthenticated state from context

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Remember me state
  const [rememberMe, setRememberMe] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * Shows an error message in the UI.
   * @param {string} message - The error message to display.
   * @param {string} type - The type of error (e.g., "warning", "error").
   */
  const showError = (message, type = "error") => {
    setError({ message, type });
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  /**
   * Handles the form submission for login.
   * @param {Event} e - The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    // Form validation
    if (!username || !password) {
      showError("Please fill all fields", "warning");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the login function from AuthContext, passing credentials and rememberMe status
      await login({ username, password }, rememberMe);

      // On successful login, navigation will be handled by the useEffect that watches `isAuthenticated`
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });

    } catch (err) {
      // Catch errors thrown from the context's login function
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render error message if it exists
  const renderErrorMessage = () => {
    if (!error) return null;
    const className = `${styles.errorMessage} ${error.type === "warning" ? styles.warningMessage : ''}`;
    return <div className={className}>{error.message}</div>;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.loginPanel}>
      {/* Left Panel with background */}
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
      </div>

      {/* Right Panel with form */}
      <div className={styles.rightPanel}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleGoBack} aria-label="Go back">
            <ArrowIcon className={styles.backIcon} />
          </button>
          <div className={styles.logoContainer}>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.logo} />
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome Back <img src={emojiSparkles} alt="✨" className={styles.sparkleIcon} />
            </h1>
            <p className={styles.welcomeSubtitle}>We're glad to see you again.</p>
          </div>

          {renderErrorMessage()}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <MailIcon className={styles.fieldIcon} />
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <LockIcon className={styles.fieldIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={styles.input}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
                {/* --- EDITED FOR ICON FIX --- */}
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <img src={eyeIcon} alt="Hide Password" /> : <img src={eyeOffIcon} alt="Show Password" />}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span>Remember Me</span>
              </label>

              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? <div className={styles.spinner}></div> : "Sign In"}
            </button>
          </form>

          <div className={styles.signupPrompt}>
            Don't have an account? <Link to="/register" className={styles.signupLink}>sign up, it's free</Link>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.copyright}>
            Copyright © 2025 <span className={styles.companyName}>Prizmatix</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;