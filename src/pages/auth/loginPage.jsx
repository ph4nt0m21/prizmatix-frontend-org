import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from "./loginPage.module.scss";

// Import SVG components
import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as LockIcon } from "../../assets/icons/lock-icon.svg";
import { ReactComponent as EyeIcon } from "../../assets/icons/eye-icon.svg";
import { ReactComponent as EyeOffIcon } from "../../assets/icons/eye-off-icon.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/arrow-icon.svg";

// Import images
import wallpaperBg from "../../assets/images/auth-bg.png";
import logoImage from "../../assets/images/logo.svg";
import emojiSparkles from "../../assets/images/emoji-sparkles_.svg";

/**
 * LoginPage component handles user authentication
 * Provides login form with validation and error handling
 * 
 * @returns {JSX.Element} The LoginPage component
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get('token');
      if (token) {
        // Redirect to previous location or home if token exists
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    };
    
    checkToken();
    
    // Clear errors when component unmounts
    return () => {
      setError(null);
    };
  }, [navigate, location]);
  
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
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { username, password } = formData;
    
    // Form validation
    if (!username || !password) {
      showError("Please fill all fields", "warning");
      return;
    }
    
    // Clear previous errors
    setError(null);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call login API
      const response = await LoginAPI(formData);
      
      if (response.status === 200) {
        // Store token in cookie - adjust expiry based on remember me
        const expiryDays = rememberMe ? 7 : 0.25; // 7 days or 6 hours
        Cookies.set('token', response.data.token, { 
          expires: expiryDays,
        });
        
        // Clear form data
        setFormData({
          username: "",
          password: "",
        });
        
        console.log("Login successful");
        
        // Navigate to home page or redirected route
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        showError(response?.data?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      
      // Extract error message from response
      if (error.response?.data?.message) {
        const { message } = error.response.data;
        
        if (Array.isArray(message)) {
          // Filter only string messages and join them
          const filteredMessages = message
            .filter((msg) => typeof msg === "string")
            .join("\n");
          
          if (filteredMessages) {
            showError(filteredMessages);
          } else {
            showError("Login failed. Please check your credentials.");
          }
        } else {
          showError(message);
        }
      } else {
        showError("Login failed. Please try again later.");
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
          {/* Left Panel with dark background and waves */}
          <div className={styles.leftPanel}>
            <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
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
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
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
                  {isLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
              
              <div className={styles.signupPrompt}>
                Don't have an account? <Link to="/register" className={styles.signupLink}>sign up, it's free</Link>
              </div>
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

export default LoginPage;