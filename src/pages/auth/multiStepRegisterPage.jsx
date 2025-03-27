// src/pages/auth/multiStepRegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useSelector, useDispatch } from 'react-redux';
import { setLoading } from '../../redux/slices/uiSlice';
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
  const dispatch = useDispatch();
  
  // Get auth context
  const { register, isAuthenticated, error: authError, clearError } = useAuth();
  
  // Get UI loading state from Redux
  const { isLoading } = useSelector((state) => state.ui);
  
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
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home page');
      navigate('/');
    }
    
    // Clear errors when component unmounts
    return () => {
      clearError();
      setError(null);
    };
  }, [isAuthenticated, navigate, clearError]);
  
  // Update progress indicator based on current step
  useEffect(() => {
    setProgress(currentStep === 1 ? 50 : 100);
  }, [currentStep]);
  
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
      region: formData.region,
      state: formData.state,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobileNumber: formData.mobileNumber,
      password: formData.password
    };
    
    // Set loading state
    dispatch(setLoading({ key: 'register', isLoading: true }));
    
    try {
      await register(registrationData);
      console.log('Registration successful');
      
      // Navigation will be handled by the useEffect that watches isAuthenticated
    } catch (err) {
      console.error('Registration failed:', err);
      setError(typeof err === 'string' ? err : 'Registration failed');
    } finally {
      dispatch(setLoading({ key: 'register', isLoading: false }));
    }
  };
  
  // Determine if register button should be disabled
  const isRegisterDisabled = isLoading?.['register'];
  
  // Show error message from either local state or auth context
  const errorMessage = error || authError;
  
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
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} ${styles.registerCard}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>▲</div>
        </div>
        
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
        
        {renderStep()}
      </div>
    </div>
  );
};

export default MultiStepRegisterPage;