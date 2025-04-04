import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import { setLoading } from '../../redux/slices/uiSlice';
import EventCreationSidebar from './components/eventCreationSidebar';
import EventHeaderNav from './components/eventHeaderNav';
import BasicInfoStep from './steps/basicInfoStep';
import LocationStep from './steps/locationStep';
import DateTimeStep from './steps/dateTimeStep';
import DescriptionStep from './steps/descriptionStep';
import ArtStep from './steps/artStep';
import TicketsStep from './steps/ticketsStep';
import DiscountCodesStep from './steps/discountCodesStep';
import PublishStep from './steps/publishStep';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import ErrorBoundary from '../../components/common/errorBoundary/errorBoundary';
import { CreateEventAPI, GetEventAPI, UpdateEventLocationAPI } from '../../services/allApis';
import styles from './createEventPage.module.scss';

/**
 * CreateEventPage component for the multi-step event creation process
 * Manages the overall state of the event creation flow and renders the appropriate step
 */
const CreateEventPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { eventId, step } = useParams();
  
  // User state - replaced AuthContext with direct user management
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Get loading state from Redux
  const { isLoading } = useSelector((state) => state.ui);
  
  // Event data state
  const [eventData, setEventData] = useState({
    // Basic Info (Step 1)
    name: '',
    eventType: 'public', // Default to public (will be translated to private: false/true)
    showHostProfile: false,
    organizationId: null, // Will be set from user context
    createdBy: null, // Will be set from user context
    
    // Location (Step 2)
    location: {
      isToBeAnnounced: false,
      isPrivateLocation: false,
      searchQuery: '',
      venue: '',
      street: '',
      streetNumber: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
      additionalInfo: '',
      latitude: '',
      longitude: ''
    },
    
    // Additional event data for other steps will be added here
    // as we implement them
  });
  
  // Track completion status for each step
  const [stepStatus, setStepStatus] = useState({
    basicInfo: { completed: false, valid: false, visited: false },
    location: { completed: false, valid: false, visited: false },
    dateTime: { completed: false, valid: false, visited: false },
    description: { completed: false, valid: false, visited: false },
    art: { completed: false, valid: false, visited: false },
    tickets: { completed: false, valid: false, visited: false },
    discountCodes: { completed: false, valid: false, visited: false },
    publish: { completed: false, valid: false, visited: false }
  });
  
  // Current step state (default to 1 if not specified)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      try {
        const token = Cookies.get('token');
        if (token) {
          const response = await LoginAPI(token);
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setUserLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  /**
   * Update step status based on event data
   * @param {Object} data - Event data
   */
  const updateStepStatusFromData = React.useCallback((data) => {
    // This is a placeholder implementation
    // In a real app, you would check specific fields to determine completion
    const newStepStatus = { ...stepStatus };
    
    // Check if basic info is complete
    if (data.name) {
      newStepStatus.basicInfo = { completed: true, valid: true, visited: true };
    }
    
    // Check if location is complete
    if (data.location) {
      const locationComplete = data.location.isToBeAnnounced || 
        (data.location.venue && data.location.street && data.location.city && data.location.state);
      
      if (locationComplete) {
        newStepStatus.location = { completed: true, valid: true, visited: true };
      }
    }
    
    // Add similar checks for other steps
    
    setStepStatus(newStepStatus);
  }, [stepStatus]);
  
  // Set user info when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setEventData(prevData => ({
        ...prevData,
        organizationId: currentUser.organizationId || 0,
        createdBy: currentUser.id || 0
      }));
    }
  }, [currentUser]);
  
  // Parse step parameter and update current step
  useEffect(() => {
    if (step) {
      const stepNumber = parseInt(step);
      if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 8) {
        setCurrentStep(stepNumber);
        
        // Mark the current step as visited
        const stepKey = getStepKeyByNumber(stepNumber);
        setStepStatus(prevStatus => ({
          ...prevStatus,
          [stepKey]: {
            ...prevStatus[stepKey],
            visited: true
          }
        }));
      } else {
        setCurrentStep(1); // Default to step 1 if invalid step parameter
      }
    } else {
      setCurrentStep(1); // Default to step 1 if no step parameter
    }
  }, [step]);
  
  // Fetch event data if eventId is provided
  useEffect(() => {
    const fetchEventData = async () => {
      if (eventId) {
        try {
          dispatch(setLoading({ key: 'fetchEvent', isLoading: true }));
          const response = await GetEventAPI(eventId);
          
          // Update event data
          setEventData(prevData => ({
            ...prevData,
            ...response.data,
            // Convert private boolean back to eventType string
            eventType: response.data.private ? 'private' : 'public'
          }));
          
          // Update step status based on fetched data
          updateStepStatusFromData(response.data);
          
        } catch (error) {
          console.error('Error fetching event data:', error);
          setError('Failed to load event data. Please try again.');
        } finally {
          dispatch(setLoading({ key: 'fetchEvent', isLoading: false }));
        }
      }
    };
    
    fetchEventData();
  }, [eventId, dispatch, updateStepStatusFromData]);
  
  /**
   * Handle input changes for the current step
   * @param {Object} e - Event object or direct value object 
   * @param {string} fieldName - Optional field name if not from event
   */
  const handleInputChange = (e, fieldName = null) => {
    const field = fieldName || e.target?.name;
    const value = e.target?.type === 'checkbox' 
      ? e.target.checked 
      : (e.target?.value ?? e);
    
    // Handle special case for location object
    if (field === 'location') {
      setEventData(prevData => ({
        ...prevData,
        location: value.location
      }));
      return;
    }
    
    // Handle special case for location validity
    if (field === 'locationValid') {
      setStepStatus(prevStatus => ({
        ...prevStatus,
        location: {
          ...prevStatus.location,
          valid: value
        }
      }));
      return;
    }
    
    setEventData({
      ...eventData,
      [field]: value
    });
  };
  
  /**
   * Validate the current step
   * @returns {boolean} Is the current step valid
   */
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return validateBasicInfo();
      case 2: // Location
        return validateLocation();
      case 3: // Date & Time
        return true; // To be implemented
      case 4: // Description
        return true; // To be implemented
      case 5: // Art
        return true; // To be implemented
      case 6: // Tickets
        return true; // To be implemented
      case 7: // Discount Codes
        return true; // To be implemented
      case 8: // Publish
        return true; // To be implemented
      default:
        return false;
    }
  };
  
  /**
   * Validate the Basic Info step
   * @returns {boolean} Is the Basic Info step valid
   */
  const validateBasicInfo = () => {
    // Check if name is filled, eventType is always valid as it defaults to 'public'
    return eventData.name.trim() !== '';
  };
  
  /**
   * Validate the Location step
   * @returns {boolean} Is the Location step valid
   */
  const validateLocation = () => {
    // If location is to be announced, it's always valid
    if (eventData.location?.isToBeAnnounced) {
      return true;
    }
    
    // Check required fields
    const location = eventData.location || {};
    
    // These fields are required if location is not TBA
    if (!location.venue || !location.street || !location.city || !location.state) {
      return false;
    }
    
    return true;
  };
  
  /**
   * Update the status of the current step
   * @param {boolean} completed - Whether the step is completed
   * @param {boolean} valid - Whether the step is valid
   */
  const updateCurrentStepStatus = (completed = false, valid = false) => {
    const stepKey = getStepKeyByNumber(currentStep);
    
    setStepStatus(prevStatus => ({
      ...prevStatus,
      [stepKey]: {
        completed,
        valid,
        visited: true
      }
    }));
  };
  
  /**
   * Get the step key by step number
   * @param {number} stepNumber - Step number
   * @returns {string} Step key
   */
  const getStepKeyByNumber = (stepNumber) => {
    switch (stepNumber) {
      case 1: return 'basicInfo';
      case 2: return 'location';
      case 3: return 'dateTime';
      case 4: return 'description';
      case 5: return 'art';
      case 6: return 'tickets';
      case 7: return 'discountCodes';
      case 8: return 'publish';
      default: return 'basicInfo';
    }
  };
  
  /**
   * Navigate to the next step
   */
  const handleNextStep = async () => {
    // Validate current step
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      // Mark current step as visited but not valid
      updateCurrentStepStatus(false, false);
      return;
    }
    
    try {
      // Set loading state
      dispatch(setLoading({ key: 'saveEvent', isLoading: true }));
      
      // Save current step data
      let updatedEventId = eventId;
      
      if (currentStep === 1 && !eventId) {
        try {
          // Create a new event if on first step and no eventId exists
          const basicInfoData = {
            name: eventData.name,
            organizationId: eventData.organizationId,
            createdBy: eventData.createdBy,
            private: eventData.eventType === 'private'
          };
          
          // Log the data being sent to help with debugging
          console.log('Sending to API:', basicInfoData);
          
          const response = await CreateEventAPI(basicInfoData);
          updatedEventId = response.data.id;
        } catch (error) {
          console.error('API Error Details:', error.response?.data || error.message);
          throw error; // Re-throw to be caught by the outer try/catch
        }
      } else if (currentStep === 2 && updatedEventId) {
        // Handle location step save
        try {
          const locationData = {
            ...eventData.location,
            eventId: updatedEventId
          };
          
          await UpdateEventLocationAPI(updatedEventId, locationData);
        } catch (error) {
          console.error('Error saving location data:', error);
          throw error;
        }
      }
      // For subsequent steps, add similar implementations
      
      // Mark current step as completed and valid
      updateCurrentStepStatus(true, true);
      
      // Navigate to the next step
      if (currentStep < 8) {
        navigate(`/events/create/${updatedEventId}/${currentStep + 1}`);
        setCurrentStep(prevStep => prevStep + 1);
      }
    } catch (error) {
      console.error('Error saving event data:', error);
      setError('Failed to save event data. Please try again.');
    } finally {
      dispatch(setLoading({ key: 'saveEvent', isLoading: false }));
    }
  };
  
  /**
   * Navigate to the previous step
   */
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      navigate(`/events/create/${eventId}/${prevStep}`);
      setCurrentStep(prevStep);
    }
  };
  
  /**
   * Navigate to a specific step directly
   * @param {number} stepNumber - Step to navigate to
   */
  const navigateToStep = (stepNumber) => {
    // Check if we can navigate to this step
    const stepKey = getStepKeyByNumber(stepNumber);
    const targetStep = stepStatus[stepKey];
    
    // Can navigate to any completed step or the next incomplete step
    const canNavigate = targetStep.completed || stepNumber === 1 || 
                        stepStatus[getStepKeyByNumber(stepNumber - 1)].completed;
    
    if (canNavigate) {
      navigate(`/events/create/${eventId}/${stepNumber}`);
      setCurrentStep(stepNumber);
    }
  };
  
  /**
   * Render the current step
   * @returns {JSX.Element} Current step component
   */
  const renderCurrentStep = () => {
    // Check if event data is loading
    if (isLoading?.['fetchEvent'] || userLoading) {
      return (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading event data...</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateBasicInfo()}
            stepStatus={stepStatus.basicInfo}
          />
        );
      case 2:
        return (
          <LocationStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateLocation()}
            stepStatus={stepStatus.location}
          />
        );
      case 3:
        return <DateTimeStep />;
      case 4:
        return <DescriptionStep />;
      case 5:
        return <ArtStep />;
      case 6:
        return <TicketsStep />;
      case 7:
        return <DiscountCodesStep />;
      case 8:
        return <PublishStep />;
      default:
        return <div>Invalid Step</div>;
    }
  };
  
  // Get current step name for header
  const getCurrentStepName = () => {
    switch (currentStep) {
      case 1: return 'Basic Info';
      case 2: return 'Location';
      case 3: return 'Date & Time';
      case 4: return 'Description';
      case 5: return 'Art';
      case 6: return 'Tickets';
      case 7: return 'Discount Codes';
      case 8: return 'Publish';
      default: return 'Create Event';
    }
  };
  
  // Determine if the Next button should be disabled
  const isNextDisabled = !validateCurrentStep() || isLoading?.['saveEvent'];
  
  // Determine if the Preview button should be available
  const canPreview = Object.values(stepStatus).some(step => step.completed);
  
  return (
    <div className={styles.createEventContainer}>
      {/* Header with breadcrumb navigation */}
      <EventHeaderNav 
        currentStep={getCurrentStepName()} 
        eventName={eventData.name || 'Untitled Event'} 
        isDraft={true}
        canPreview={canPreview}
      />
      
      <div className={styles.content}>
        {/* Sidebar for step navigation */}
        <EventCreationSidebar 
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={navigateToStep}
        />
        
        {/* Main content area */}
        <div className={styles.mainContent}>
          <ErrorBoundary>
            {error && (
              <div className={styles.errorMessage}>
                {error}
                <button 
                  className={styles.dismissButton}
                  onClick={() => setError(null)}
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className={styles.stepContent}>
              {renderCurrentStep()}
            </div>
            
            <div className={styles.navigation}>
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={styles.backButton}
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isNextDisabled}
                className={styles.nextButton}
              >
                {isLoading?.['saveEvent'] ? 'Saving...' : 'Next'}
              </button>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;