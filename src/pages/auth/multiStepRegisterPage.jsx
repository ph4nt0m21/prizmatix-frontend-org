import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { OrganizationRegisterAPIComplete, OrganizationRegisterInitiateAPI, ProfileAPI } from '../../services/allApis';
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
    bio: '',
    
    

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
      console.log('User is authenticated, redirecting to home page');
      // Redirect to home page directly
      navigate('/', { replace: true });
    }
    
    // Clear errors when component unmounts
    return () => {
      clearError();
      setError(null);
    };
  }, [isAuthenticated, navigate]);
  
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
 * Verify email address by calling the initiate API
 */
const verifyEmail = async () => {
  // Validate email
  if (!validateEmail()) {
    return;
  }
  
  // Set loading state
  setLoadingState('email-verification', true);
  
  try {
    // Call the initiate API
    const response = await OrganizationRegisterInitiateAPI({ 
      email: formData.email 
    });
    
    console.log('OTP sent successfully:', response);
    
    // Move to verification code step
    setVerificationStep('code-verification');
    
    // Show a success message
    showError('Verification code sent to your email!', 'info');
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Set error message
    let errorMessage = 'Failed to send verification code. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showError(errorMessage);
  } finally {
    setLoadingState('email-verification', false);
  }
};
  
  /**
   * Extract token from various response formats
   * @param {Object} response - API response
   * @returns {string|null} Extracted token or null
   */
  const extractTokenFromResponse = (response) => {
    if (!response || !response.data) return null;
    
    // Check for token in various formats
    if (response.data.token) return response.data.token;
    if (response.data.accessToken) return response.data.accessToken;
    if (response.data.jwt) return response.data.jwt;
    if (response.data.auth_token) return response.data.auth_token;
    
    // Check if response.data is the token string directly
    if (typeof response.data === 'string') return response.data;
    
    return null;
  };
  
  /**
   * Format error message from API error
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  const formatErrorMessage = (error) => {
    if (!error) return 'Registration failed. Please try again.';
    
    // Default error message
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response) {
      if (error.response.data) {
        // Handle structured error message
        if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            // Join array of error messages into a single string
            errorMessage = error.response.data.message
              .filter(msg => typeof msg === 'string')
              .join('. ');
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.response.status) {
        // Handle HTTP status-based errors
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid registration data. Please check your inputs.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please try again.';
            break;
          case 409:
            errorMessage = 'This email is already registered. Please use another email or try logging in.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Registration failed (${error.response.status}). Please try again.`;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return errorMessage;
  };
  
  /**
   * Reset all form data after successful registration
   */
  const resetFormData = () => {
    setFormData({

      email: '',
      
      password: '',
      confirmPassword: '',

      // Basic fields
      firstName: '',
      lastName: '',
      mobileNumber: '',
     
      // Organization fields
      name: '',
      description: '',
      bio: '',  // This field is missing in your current reset
      
      // Event field
      eventName: ''
    });
    
    // Reset uploaded logo state
    setUploadedLogo(null);
    
    // Reset social media links
    setSocialLinks([]);
  };
  
  const handleSubmit = async () => {
  // Clear previous errors
  clearError();
  setError(null);
  
  try {
    // Set loading state
    setLoadingState('register', true);
    
    // Map form data to the database schema
    const registrationData = {
      // Required fields from API schema
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobileNumber: formData.mobileNumber,
      password: formData.password,
      
      // Organization profile fields - handle skipped step with defaults
      name: formData.name || `${formData.firstName}'s Organization`, // Use default name if skipped
      description: formData.description || "Organization description", // Default description
      bio: formData.bio || "", // Default bio
      profilePhoto: "profile", // Default profile photo
      
      // If socialLinks is empty, provide an empty array
      socialMediaLinks: socialLinks && socialLinks.length > 0 
        ? socialLinks.map(link => ({
            platform: link.platform,
            url: link.url
          })) 
        : []
    };
    
    console.log('Sending registration data:', registrationData);
    
    // Call OrganizationRegisterAPIComplete from allApis.js
    const response = await OrganizationRegisterAPIComplete(registrationData);
    console.log('Registration successful:', response);
    
    // Process the response
    if (response && response.data) {
      // Handle token from response, checking different possible formats
      const token = extractTokenFromResponse(response);
      
      if (token) {
        // Store token in cookie - use same expiry as login page (1 day)
        Cookies.set('token', token, { 
          expires: 1 // Use fixed 1 day expiry to match login page
        });
        
        console.log('Token stored in cookie successfully');
      }
      
      // Format user data to match login page format
      const userData = {
        id: response.data.userId || response.data.id || response.data.user?.id,
        organizationId: response.data.organizationId || response.data.organization?.id,
        organizationName: response.data.name || `${formData.firstName}'s Organization`,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: response.data.role || 'organization_admin'
      };
      
      console.log('Storing user data to localStorage:', userData);
      
      // Store in localStorage - same format as login page
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update authentication state
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      // Clear form data and files on success
      resetFormData();
      
      // Show success message
      showError('Registration successful! Redirecting...', 'info');
      
      // Redirect to home page after successful registration
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      throw new Error('Invalid response received from server');
    }
  } catch (error) {
    console.error('Registration failed:', error);
    
    // Extract and format error message
    const errorMessage = formatErrorMessage(error);
    
    // Show error message
    showError(errorMessage);
    
    // Set auth error state as well
    setAuthError(errorMessage);
  } finally {
    setLoadingState('register', false);
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
   * This is an updated version that allows skipping validation
   * @param {boolean} allowEmpty - Whether to allow empty fields (for skip button)
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateOrganizationProfile = (allowEmpty = false) => {
    // If we're allowing empty fields (for skip functionality), return true
    if (allowEmpty) {
      console.log("Skipping organization profile validation");
      return true;
    }
    
    const errors = {};
    let isValid = true;
    
    // Organization name validation
    // if (!formData.name || !formData.name.trim()) {
    //   errors.name = 'Organization name is required';
    //   isValid = false;
    // }
    
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
          handleSubmit={handleSubmit}
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