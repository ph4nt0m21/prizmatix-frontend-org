import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from "./authPages.module.scss";

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
    // This is a dummy function for now
    console.log("Go back clicked");
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
      
      {/* Right side - login form */}
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
            <h1 className={styles.welcomeTitle}>Welcome Back <span className={styles.purpleStar}>✦</span></h1>
            <p className={styles.welcomeSubtitle}>We're glad to see you again.</p>
          </div>
          
          {renderErrorMessage()}
          
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,8l-8,5L4,8V6l8,5l8-5V8z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  id="username"
                  name="username"
                  className={styles.modernInput}
                  placeholder="Email"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
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
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            
            <div className={styles.formOptions}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                  Remember Me
                </label>
              </div>
              
              <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.buttonSpinner}></span>
              ) : (
                "Sign In"
              )}
            </button>
            
            <div className={styles.signupPrompt}>
              Don't have an account? <Link to="/register" className={styles.signupLink}>Sign up, it's free</Link>
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

export default LoginPage;