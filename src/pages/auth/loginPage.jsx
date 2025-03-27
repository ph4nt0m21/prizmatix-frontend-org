// src/pages/auth/loginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useSelector, useDispatch } from 'react-redux';
import { setLoading } from '../../redux/slices/uiSlice';
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
  const dispatch = useDispatch();
  
  // Get auth context
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  
  // Get UI loading state from Redux
  const { isLoading } = useSelector((state) => state.ui);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  // Local error state
  const [error, setError] = useState(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to previous location or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
    
    // Clear errors when component unmounts
    return () => {
      clearError();
      setError(null);
    };
  }, [isAuthenticated, navigate, location, clearError]);
  
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { username, password } = formData;
    
    // Form validation
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    
    // Clear previous errors
    setError(null);
    clearError();
    
    // Set loading state
    dispatch(setLoading({ key: 'login', isLoading: true }));
    
    try {
      await login(formData);
      
      // Clear form data
      setFormData({
        username: "",
        password: "",
      });
      
      console.log("Login successful");
      
      // Navigation is handled by the useEffect monitoring isAuthenticated
    } catch (error) {
      console.error("Login failed:", error);
      
      // Set error message
      setError(typeof error === 'string' ? error : "Login failed");
    } finally {
      dispatch(setLoading({ key: 'login', isLoading: false }));
    }
  };
  
  // Determine if login button should be disabled
  const isLoginDisabled = isLoading?.['login'];
  
  // Show error message from either local state or auth context
  const errorMessage = error || authError;
  
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>▲</div>
        </div>
        
        <h1 className={styles.authTitle}>Sign in</h1>
        <p className={styles.authSubtitle}>Enter your credentials to access your account</p>
        
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        
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
              disabled={isLoginDisabled}
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
              disabled={isLoginDisabled}
            />
          </div>
          
          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoginDisabled}
          >
            {isLoginDisabled ? (
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