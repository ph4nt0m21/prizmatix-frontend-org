import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { RegisterAPI, ProfileAPI } from '../../services/allApis';
import EmailVerification from './registerSteps/emailVerification';
import BasicDetails from './registerSteps/basicDetails';
import CreatePassword from './registerSteps/createPassword';
import OrganizationProfile from './registerSteps/organizationProfile';
import CreateEvent from './registerSteps/createEvent';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './register.module.scss';

/**
 * MultiStepRegisterPage component 
 * Handles organization registration with a multi-step form process
 * 
 * @returns {JSX.Element} The MultiStepRegisterPage component
 */
const MultiStepRegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI loading state
  const [isLoading, setIsLoading] = useState({});
  
  // Auth state management
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Step state
  const [currentStep, setCurrentStep] = useState(0); // Start at step 0 (email verification)
  
  // Email verification sub-step state
  const [verificationStep, setVerificationStep] = useState('email-entry'); // 'email-entry' or 'code-verification'
  
  // Local error state
  const [error, setError] = useState(null);
  
  // Organization profile additional state
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    // Email Verification (Step 0)
    email: '',
    
    // Basic Details (Step 1)
    firstName: '',
    lastName: '',
    mobileNumber: '',
    
    // Create Password (Step 2)
    password: '',
    confirmPassword: '',
    
    // Organization Profile (Step 3)
    name: '',
    description: '',
    region: '',
    state: '',

    // Create Event (Step 4)
    eventName: '',
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Progress state (for progress indicator)
  const [progress, setProgress] = useState(20);
  
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
    if (currentStep === 0) setProgress(20);
    else if (currentStep === 1) setProgress(40);
    else if (currentStep === 2) setProgress(60);
    else if (currentStep === 3) setProgress(80);
    else setProgress(100);
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
   * Verify email address
   */
  const verifyEmail = () => {
    // Validate email
    if (!validateEmail()) {
      return;
    }
    
    // Set loading state
    setLoadingState('email-verification', true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Move to verification code step
      setVerificationStep('code-verification');
      setLoadingState('email-verification', false);
      
      // Show a success message
      showError('Verification code sent to your email!', 'info');
    }, 1000);
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
   * Clear auth errors
   */
  const clearError = () => {
    setAuthError(null);
  };
  
  /**
   * Handle input changes for all steps
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
   * Handle file upload for organization logo
   * @param {File} file - The uploaded file
   */
  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedLogo({
          url: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  /**
   * Validate email
   * @returns {boolean} True if email is valid, false otherwise
   */
  const validateEmail = () => {
    const errors = {};
    let isValid = true;
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  /**
   * Validate basic details form data
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateBasicDetails = () => {
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
    
    setValidationErrors(errors);
    return isValid;
  };
  
  /**
   * Validate password form data
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validatePassword = () => {
    const errors = {};
    let isValid = true;
    
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
    
    setValidationErrors(errors);
    return isValid;
  };
  
  /**
   * Validate organization profile form data
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateOrganizationProfile = () => {
    const errors = {};
    let isValid = true;
    
    // Organization name validation
    if (!formData.name.trim()) {
      errors.name = 'Organization name is required';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  /**
   * Validate event form data
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateEvent = () => {
    const errors = {};
    let isValid = true;
    
    // Event name validation (only if not skipping)
    if (formData.eventName && !formData.eventName.trim()) {
      errors.eventName = 'Event name is required if creating an event';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  /**
   * Proceed to the next step
   */
  const nextStep = () => {
    // Different validation based on current step
    if (currentStep === 0) {
      // Email verification step is now managed by its own component
      setCurrentStep(1);
    } else if (currentStep === 1 && validateBasicDetails()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validatePassword()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateOrganizationProfile()) {
      setCurrentStep(4);
    }
  };
  
  /**
   * Go back to the previous step
   */
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      
      // Reset verification step if going back to email verification
      if (currentStep === 1) {
        setVerificationStep('code-verification');
      }
    }
  };
  
  /**
   * Submit the registration form
   */
  const handleSubmit = async () => {
    // Clear previous errors
    clearError();
    setError(null);
    
    // Prepare registration data
    const registrationData = {
      name: formData.name,
      description: formData.description,
      email: formData.email,
      username: formData.email, // Use email as username
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobileNumber: formData.mobileNumber,
      password: formData.password,
      logo: uploadedLogo?.url,
      socialLinks: socialLinks,
      eventName: formData.eventName // Include event name if provided
    };
    
    // Set loading state
    setLoadingState('register', true);
    
    try {
      await register(registrationData);
      console.log('Registration successful');
      
      // Clear form data on success
      setFormData({
        email: '',
        name: '',
        description: '',
        region: '',
        state: '',
        firstName: '',
        lastName: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        eventName: ''
      });
      setUploadedLogo(null);
      setSocialLinks([]);
      
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
      (error?.type === "warning" ? ` ${styles.warningMessage}` : '') +
      (error?.type === "info" ? ` ${styles.infoMessage}` : '');
    
    return <div className={className}>{errorMessage}</div>;
  };
  
  // If still checking auth status, show loading state
  if (authLoading && !isRegisterDisabled) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  
  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <EmailVerification 
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            errors={validationErrors}
            isLoading={isLoading?.['email-verification']}
            verificationStep={verificationStep}
            setVerificationStep={setVerificationStep}
            verifyEmail={verifyEmail}
            onGoBack={() => navigate('/login')}
          />
        );
      case 1:
        return (
          <BasicDetails 
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            errors={validationErrors}
            isLoading={isRegisterDisabled}
            onGoBack={prevStep}
          />
        );
      case 2:
        return (
          <CreatePassword 
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            errors={validationErrors}
            isLoading={isRegisterDisabled}
            onGoBack={prevStep}
          />
        );
      case 3:
        return (
          <OrganizationProfile 
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            errors={validationErrors}
            isLoading={isRegisterDisabled}
            handleFileUpload={handleFileUpload}
            uploadedLogo={uploadedLogo}
            setUploadedLogo={setUploadedLogo}
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            onGoBack={prevStep}
          />
        );
      case 4:
        return (
          <CreateEvent
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            handleSubmit={handleSubmit}
            errors={validationErrors}
            isLoading={isRegisterDisabled}
            onGoBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return renderStep();
};

export default MultiStepRegisterPage;