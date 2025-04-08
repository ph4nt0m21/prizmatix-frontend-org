// src/pages/auth/multiStepRegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { RegisterAPI, ProfileAPI } from '../../services/allApis';
import Step1OrganizationInfo from './registerSteps/step1OrganizationInfo';
import Step2AccountDetails from './registerSteps/step2AccountDetails';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './authPages.module.scss';

/**
 * MultiStepRegisterPage component 
 * Handles organization registration with a multi-step form process
 * 
 * @returns {JSX.Element} The MultiStepRegisterPage component
 */
const MultiStepRegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI loading state (moved from Redux)
  const [isLoading, setIsLoading] = useState({});
  
  // Auth state management
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Local error state
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Organization Info (Step 1)
    name: '',
    description: '',
    email: '',
    region: '',
    state: '',
    
    // Account Details (Step 2)
    firstName: '',
    lastName: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    // agreeToTerms: false
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Progress state (for progress indicator)
  const [progress, setProgress] = useState(50);
  
  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to previous page or home');
      // Redirect to previous location or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
    
    // Clear errors when component unmounts
    return () => {
      clearError();
      setError(null);
    };
  }, [isAuthenticated, navigate, location]);
  
  // Update progress indicator based on current step
  useEffect(() => {
    setProgress(currentStep === 1 ? 50 : 100);
  }, [currentStep]);
  
  /**
   * Set loading state for a specific action
   * @param {string} key - The key to identify the loading state
   * @param {boolean} loadingState - Whether the action is loading
   */
  const setLoadingState = (key, loadingState) => {
    setIsLoading(prevState => ({
      ...prevState,
      [key]: loadingState
    }));
  };
  
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
   * Check if the user is authenticated based on token presence
   */
  const checkAuthStatus = async () => {
    setAuthLoading(true);
    try {
      const token = Cookies.get('token');
      
      if (token) {
        // Token exists, try to fetch user profile
        try {
          const response = await ProfileAPI(token);
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Even if profile fetch fails, if token exists, consider authenticated
          setIsAuthenticated(true);
        }
      } else {
        // No token, not authenticated
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setAuthLoading(false);
    }
  };
  
  /**
   * Register a new organization
   * @param {Object} userData - Registration data
   * @returns {Promise} Promise resolving to registration result
   */
  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Add username from email if not provided
      const registrationData = {
        ...userData,
        username: userData.username || userData.email // Use email as username if not provided
      };
      
      console.log('Sending registration data:', registrationData);
      const response = await RegisterAPI(registrationData);
      console.log('Registration response:', response);
      
      // Standard token handling logic
      if (response.status === 200) {
        // Store token in cookie if provided
        if (response.data && response.data.token) {
          Cookies.set('token', response.data.token, { 
            expires: 1, // 1 day
          });
        } else if (typeof response.data === 'string') {
          Cookies.set('token', response.data, { 
            expires: 1,
          });
        } else if (response.data) {
          // Check for nested token
          const token = response.data.accessToken || response.data.jwt || response.data.auth_token;
          if (token) {
            Cookies.set('token', token, {
              expires: 1,
            });
          }
        }
        
        // Ensure the user object contains necessary fields
        const user = response.data.user || {};
        if (!user.name) {
          user.name = `${userData.firstName} ${userData.lastName}`;
        }
        
        // Set user and authentication state
        setCurrentUser(user);
        setIsAuthenticated(true);
        return response.data;
      } else {
        throw new Error(response?.data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract error message from response
      if (error.response?.data?.message) {
        const { message } = error.response.data;
        
        if (Array.isArray(message)) {
          // Filter only string messages and join them
          const filteredMessages = message
            .filter((msg) => typeof msg === "string")
            .join("\n");
          
          setAuthError(filteredMessages || 'Registration failed. Please check your details.');
          throw filteredMessages || 'Registration failed. Please check your details.';
        } else {
          setAuthError(message);
          throw message;
        }
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.message || 
                            'Registration failed. Please try again.';
        setAuthError(errorMessage);
        throw errorMessage;
      }
    } finally {
      setAuthLoading(false);
    }
  };
  
  /**
   * Logout user
   */
  const logout = () => {
    Cookies.remove('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  /**
   * Clear auth errors
   */
  const clearError = () => {
    setAuthError(null);
  };
  
  /**
   * Handle input changes for both steps
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
    
    // Handle checkbox inputs
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: inputValue,
    });
  };
  
  /**
   * Validate step 1 form data
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateStep1 = () => {
    const errors = {};
    let isValid = true;
    
    // Organization name validation
    if (!formData.name.trim()) {
      errors.name = 'Organization name is required';
      isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Region validation
    if (!formData.region.trim()) {
      errors.region = 'Region is required';
      isValid = false;
    }
    
    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State is required';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  /**
   * Validate step 2 form data
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateStep2 = () => {
    const errors = {};
    let isValid = true;
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    
    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      errors.mobileNumber = 'Mobile number is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Terms agreement validation
    // if (!formData.agreeToTerms) {
    //   errors.agreeToTerms = 'You must agree to the terms and conditions';
    //   isValid = false;
    // }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  /**
   * Proceed to the next step
   */
  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };
  
  /**
   * Go back to the previous step
   */
  const prevStep = () => {
    setCurrentStep(1);
  };
  
  /**
   * Submit the registration form
   */
  const handleSubmit = async () => {
    // Validate the form
    if (!validateStep2()) {
      return;
    }
    
    // Clear previous errors
    clearError();
    setError(null);
    
    // Prepare registration data
    const registrationData = {
      name: formData.name,
      description: formData.description,
      email: formData.email,
      username: formData.email, // Use email as username
      region: formData.region,
      state: formData.state,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobileNumber: formData.mobileNumber,
      password: formData.password
    };
    
    // Set loading state
    setLoadingState('register', true);
    
    try {
      await register(registrationData);
      console.log('Registration successful');
      
      // Clear form data on success
      setFormData({
        name: '',
        description: '',
        email: '',
        region: '',
        state: '',
        firstName: '',
        lastName: '',
        mobileNumber: '',
        password: '',
        confirmPassword: ''
      });
      
      // Navigation will be handled by the useEffect that watches isAuthenticated
    } catch (err) {
      console.error('Registration failed:', err);
      showError(typeof err === 'string' ? err : 'Registration failed');
    } finally {
      setLoadingState('register', false);
    }
  };
  
  // Determine if register button should be disabled
  const isRegisterDisabled = isLoading?.['register'] || authLoading;
  
  // Show error message from either local state or auth state
  const errorMessage = error?.message || authError;
  
  // Render error message if exists
  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    
    const className = styles.errorMessage + 
      (error?.type === "warning" ? ` ${styles.warningMessage}` : '');
    
    return <div className={className}>{errorMessage}</div>;
  };
  
  // If still checking auth status, show loading state
  if (authLoading && !isRegisterDisabled) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  
  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1OrganizationInfo 
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            errors={validationErrors}
            isLoading={isRegisterDisabled}
          />
        );
      case 2:
        return (
          <Step2AccountDetails 
            formData={formData}
            handleChange={handleChange}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            errors={validationErrors}
            isLoading={isRegisterDisabled}
            serverError={errorMessage}
          />
        );
      default:
        return null;
    }
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
      
      {/* Right side - registration form */}
      <div className={styles.rightPanel}>
        <div className={styles.topBar}>
          <button 
            type="button" 
            className={styles.goBackButton}
            onClick={() => navigate('/login')}
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
        
        <div className={styles.registerFormContainer}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={styles.stepIndicator}>
              Step {currentStep} of 2
            </div>
          </div>
          
          {isRegisterDisabled && <LoadingSpinner size="small" />}
          
          {renderErrorMessage()}
          
          {renderStep()}
        </div>
        
        <div className={styles.footerContainer}>
          <p className={styles.copyrightText}>Copyright© 2025 PRIZMATIX</p>
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegisterPage;