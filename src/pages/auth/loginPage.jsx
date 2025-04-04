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
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
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
        // Store token in cookie
        Cookies.set('token', response.data.token, { 
          expires: 0.25, // 6 hours
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
  
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>▲</div>
        </div>
        
        <h1 className={styles.authTitle}>Sign in</h1>
        <p className={styles.authSubtitle}>Enter your credentials to access your account</p>
        
        {renderErrorMessage()}
        
        <form className={styles.authForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.inputLabel}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={styles.input}
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}></span>
            ) : (
              "Login"
            )}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;