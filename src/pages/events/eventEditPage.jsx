/*
File: src/pages/events/eventEditPage.jsx
*/
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import EventHeaderNav from './components/eventHeaderNav';
import EditEventSidebar from './components/editEventSidebar';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './eventEditPage.module.scss';

// Import step components (reusing existing ones)
import BasicInfoStep from './steps/basicInfoStep';
import LocationStep from './steps/locationStep';
import DateTimeStep from './steps/dateTimeStep';
import DescriptionStep from './steps/descriptionStep';
import ArtStep from './steps/artStep';

// Import API services (placeholder, will be actual APIs later)
import {
  GetEventAPI,
  UpdateEventBasicInfoAPI,
  UpdateEventLocationAPI,
  UpdateEventDateTimeAPI,
  UpdateEventDescriptionAPI,
  UpdateEventArtAPI,
} from '../../services/allApis';

// Import utility functions
import {
  getEventData,
  saveEventData,
  clearEventData,
  // prepareBasicInfoDataForAPI,
  prepareLocationDataForAPI,
  prepareDateTimeDataForAPI,
  prepareDescriptionDataForAPI,
  prepareArtDataForAPI,
} from '../../utils/eventUtil';


/**
 * EventEditPage component for editing existing event details in a multi-step flow.
 */
const EventEditPage = () => {
  const { eventId: paramEventId, step: paramStep } = useParams();
  const navigate = useNavigate();

  // State for current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Basic Info, Location, Date & Time, Description, Art

  // State for event data being edited
  const [eventData, setEventData] = useState(() => {
    // Try to load from session storage first, then default structure
    const storedEventData = getEventData(paramEventId);
    return storedEventData || {
      id: paramEventId || null,
      basicInfo: {
        eventName: '',
        organizerName: '',
        category: '',
        eventType: '',
        searchTags: [],
        visibility: 'public',
      },
      location: {
        locationType: 'physical',
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
        longitude: '',
        formattedAddress: '',
      },
      dateTime: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      },
      description: '',
      artData: {
        thumbnailFile: null,
        thumbnailUrl: null,
        bannerFile: null,
        bannerUrl: null,
      },
    };
  });

  // State for step validity and visited status for validation
  const [stepStatus, setStepStatus] = useState(() => {
    const storedStatus = sessionStorage.getItem(`eventEditStepStatus_${paramEventId}`);
    return storedStatus ? JSON.parse(storedStatus) : {
      basicInfo: { completed: false, valid: false, visited: false },
      location: { completed: false, valid: false, visited: false },
      dateTime: { completed: false, valid: false, visited: false },
      description: { completed: false, valid: false, visited: false },
      art: { completed: false, valid: false, visited: false },
    };
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    initialLoad: true,
    saveEvent: false,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Map step numbers to their keys for status tracking
  const stepKeys = {
    1: 'basicInfo',
    2: 'location',
    3: 'dateTime',
    4: 'description',
    5: 'art',
  };

  const getStepKey = useCallback((stepNum) => stepKeys[stepNum], []);

  // Effect to sync URL param with current step
  useEffect(() => {
    if (paramStep) {
      const stepNum = parseInt(paramStep, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= totalSteps) {
        setCurrentStep(stepNum);
      } else {
        navigate(`/events/edit-page/${paramEventId}/1`, { replace: true });
      }
    } else if (paramEventId) {
      // If no step specified, default to 1
      navigate(`/events/edit-page/${paramEventId}/1`, { replace: true });
    }
  }, [paramStep, paramEventId, navigate, totalSteps]);


  // Effect to load initial event data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      if (!paramEventId) {
        setError('No Event ID provided. Please navigate from the Manage Event page.');
        setIsLoading({ ...isLoading, initialLoad: false });
        return;
      }

      setIsLoading(prev => ({ ...prev, initialLoad: true }));
      try {
        const storedData = getEventData(paramEventId);
        if (storedData && storedData.id === paramEventId) {
          setEventData(storedData);
          const storedStatus = sessionStorage.getItem(`eventEditStepStatus_${paramEventId}`);
          if (storedStatus) {
            setStepStatus(JSON.parse(storedStatus));
          }
          console.log("Loaded event data from session storage for editing:", storedData);
        } else {
          const token = Cookies.get('token');
          if (!token) {
            navigate('/login');
            return;
          }
          // Simulate API call
          // const response = await GetEventAPI(paramEventId, token);
          await new Promise(resolve => setTimeout(resolve, 800));
          const mockResponse = {
            id: paramEventId,
            basicInfo: {
              eventName: 'NORR Festival 2022',
              organizerName: 'Eventure Co.',
              category: 'Music',
              eventType: 'Festival',
              searchTags: ['music', 'festival', 'norway'],
              visibility: 'public',
            },
            location: {
              locationType: 'physical',
              isToBeAnnounced: false,
              isPrivateLocation: false,
              searchQuery: 'Queenstown Gardens, New Zealand',
              venue: 'Queenstown Gardens',
              street: 'Park Street',
              streetNumber: '',
              city: 'Queenstown',
              postalCode: '9300',
              state: 'Otago',
              country: 'New Zealand',
              additionalInfo: 'Near the pond.',
              latitude: '-45.0317',
              longitude: '168.6583',
              formattedAddress: 'Queenstown Gardens, Park St, Queenstown 9300, New Zealand',
            },
            dateTime: {
              startDate: '2025-05-12',
              startTime: '10:00',
              endDate: '2025-05-12',
              endTime: '22:00',
            },
            description: 'The premier music festival in Norway, featuring top artists and immersive experiences.',
            artData: {
              thumbnailFile: null,
              thumbnailUrl: 'https://via.placeholder.com/150?text=Thumb',
              bannerFile: null,
              bannerUrl: 'https://via.placeholder.com/800x300?text=Banner',
            },
          };
          setEventData(mockResponse);
          saveEventData(paramEventId, mockResponse);
          console.log("Fetched event data from API for editing:", mockResponse);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching event for editing:", err);
        setError('Failed to load event details. Please try again.');
        clearEventData(paramEventId);
      } finally {
        setIsLoading(prev => ({ ...prev, initialLoad: false }));
      }
    };

    fetchEventData();
  }, [paramEventId, navigate]);


  // Effect to save eventData and stepStatus to session storage on changes
  useEffect(() => {
    if (eventData.id) {
      saveEventData(eventData.id, eventData);
      sessionStorage.setItem(`eventEditStepStatus_${eventData.id}`, JSON.stringify(stepStatus));
    }
  }, [eventData, stepStatus]);


  /**
   * Universal handler for input changes in child step components.
   * Updates the corresponding part of the eventData state.
   * @param {string} sectionKey - The key of the section (e.g., 'basicInfo', 'location')
   * @param {string} fieldName - The name of the input field
   * @param {*} value - The new value of the input
   */
  const handleInputChange = useCallback((sectionKey, fieldName, value) => {
    setEventData(prevData => {
      const updatedData = { ...prevData };
      if (typeof updatedData[sectionKey] === 'object' && updatedData[sectionKey] !== null) {
        // For nested objects (basicInfo, location, dateTime, artData)
        updatedData[sectionKey] = {
          ...updatedData[sectionKey],
          [fieldName]: value,
        };
      } else {
        // For direct fields (description)
        updatedData[sectionKey] = value;
      }
      return updatedData;
    });

    // Mark current step as visited when an input changes
    setStepStatus(prevStatus => ({
      ...prevStatus,
      [sectionKey]: {
        ...prevStatus[sectionKey],
        visited: true,
      },
    }));
  }, []);

  /**
   * Validates the current step's data.
   * This logic should mirror the validation rules within each step component.
   * @returns {boolean} True if the current step's data is valid, false otherwise.
   */
  const validateCurrentStep = useCallback(() => {
    const currentStepKey = getStepKey(currentStep);
    let isValid = true;

    // Validation logic for each step
    switch (currentStepKey) {
      case 'basicInfo':
        const basic = eventData.basicInfo;
        isValid = !!basic.eventName && !!basic.organizerName && !!basic.category && !!basic.eventType;
        break;
      case 'location':
        const loc = eventData.location;
        if (loc.locationType === 'physical' && !loc.isToBeAnnounced && !loc.isPrivateLocation) {
          isValid = !!loc.venue && !!loc.street && !!loc.city && !!loc.country;
        } else if (loc.locationType === 'online') {
          isValid = true;
        }
        break;
      case 'dateTime':
        const dt = eventData.dateTime;
        isValid = !!dt.startDate && !!dt.startTime && !!dt.endDate && !!dt.endTime;
        if (isValid) {
          const startDateTime = new Date(`${dt.startDate}T${dt.startTime}`);
          const endDateTime = new Date(`${dt.endDate}T${dt.endTime}`);
          isValid = startDateTime <= endDateTime;
        }
        break;
      case 'description':
        isValid = !!eventData.description.trim();
        break;
      case 'art':
        const art = eventData.artData;
        isValid = !!art.thumbnailUrl && !!art.bannerUrl;
        break;
      default:
        isValid = true;
    }

    setStepStatus(prevStatus => ({
      ...prevStatus,
      [currentStepKey]: {
        ...prevStatus[currentStepKey],
        valid: isValid,
        visited: true,
      },
    }));
    return isValid;
  }, [currentStep, eventData, getStepKey]);

  /**
   * Handles navigation to the previous step.
   */
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigate(`/events/edit-page/${paramEventId}/${prevStep}`);
      setError(null);
    }
  };

  /**
   * Handles navigation to the next step or submitting the event.
   */
  const handleNextStep = async () => {
    const currentStepKey = getStepKey(currentStep);
    const isCurrentStepValid = validateCurrentStep();

    if (!isCurrentStepValid) {
      setError('Please fix the errors in the current step before proceeding.');
      return;
    }

    setError(null);

    // Simulate API call for the current step
    setIsLoading(prev => ({ ...prev, saveEvent: true }));
    try {
      const token = Cookies.get('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let apiCall;
      let payload;

      switch (currentStepKey) {
        // case 'basicInfo':
        //   payload = prepareBasicInfoDataForAPI(eventData.basicInfo);
        //   // apiCall = UpdateEventBasicInfoAPI(eventData.id, payload, token);
        //   break;
        case 'location':
          payload = prepareLocationDataForAPI(eventData.location);
          // apiCall = UpdateEventLocationAPI(eventData.id, payload, token);
          break;
        case 'dateTime':
          payload = prepareDateTimeDataForAPI(eventData.dateTime);
          // apiCall = UpdateEventDateTimeAPI(eventData.id, payload, token);
          break;
        case 'description':
          payload = prepareDescriptionDataForAPI(eventData.description);
          // apiCall = UpdateEventDescriptionAPI(eventData.id, payload, token);
          break;
        case 'art':
          payload = prepareArtDataForAPI(eventData.artData);
          // apiCall = UpdateEventArtAPI(eventData.id, payload, token);
          break;
        default:
          break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setStepStatus(prevStatus => ({
        ...prevStatus,
        [currentStepKey]: {
          ...prevStatus[currentStepKey],
          completed: true,
          valid: true,
        },
      }));
      setSuccessMessage(`${currentStepKey} updated successfully!`);

      // Move to the next step or finalize
      if (currentStep < totalSteps) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        navigate(`/events/edit-page/${paramEventId}/${nextStep}`);
      } else {
        setSuccessMessage('Event details updated successfully!');
        navigate(`/events/manage/${eventData.id}/overview`);
        clearEventData(eventData.id);
      }
    } catch (err) {
      console.error(`Error updating ${currentStepKey}:`, err);
      setError(`Failed to update ${currentStepKey}. Please try again.`);
      setStepStatus(prevStatus => ({
        ...prevStatus,
        [currentStepKey]: {
          ...prevStatus[currentStepKey],
          completed: false,
        },
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, saveEvent: false }));
    }
  };

  /**
   * Renders the current step component.
   * @returns {JSX.Element} The component for the current step.
   */
  const renderCurrentStep = useCallback(() => {
    const currentStepKey = getStepKey(currentStep);
    const stepProps = {
      eventData: eventData,
      handleInputChange: handleInputChange,
      isValid: stepStatus[currentStepKey]?.valid || false,
      stepStatus: stepStatus[currentStepKey] || { visited: false, valid: false, completed: false },
    };

    switch (currentStepKey) {
      case 'basicInfo':
        return <BasicInfoStep {...stepProps} />;
      case 'location':
        return <LocationStep {...stepProps} />;
      case 'dateTime':
        return <DateTimeStep {...stepProps} />;
      case 'description':
        return <DescriptionStep {...stepProps} />;
      case 'art':
        return <ArtStep {...stepProps} />;
      default:
        return (
          <div className={styles.placeholderContainer}>
            <h2 className={styles.placeholderTitle}>Unknown Step</h2>
            <p className={styles.placeholderMessage}>This step is not recognized.</p>
          </div>
        );
    }
  }, [currentStep, eventData, handleInputChange, stepStatus, getStepKey]);


  // Show loading spinner for initial data fetch
  if (isLoading.initialLoad) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading event details for editing...</p>
      </div>
    );
  }

  // Show error if eventId is missing after initial load
  if (error && !eventData.id) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    );
  }


  const isNextDisabled = !stepStatus[getStepKey(currentStep)]?.valid || isLoading.saveEvent;
  const canPreview = true;

  return (
    <>
      <EventHeaderNav
        currentStep={`Edit ${getStepKey(currentStep)}`}
        eventName={eventData.basicInfo?.eventName || 'Loading Event...'}
        isDraft={false}
        canPreview={canPreview}
        context="edit" // Pass the context
        eventId={paramEventId || ''} // Pass eventId
      />

      <div className={styles.content}>
        <EditEventSidebar
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={setCurrentStep}
          eventId={paramEventId}
        />

        <div className={styles.mainContent}>
          {/* Success message (if any) */}
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
              <button
                className={styles.dismissButton}
                onClick={() => setSuccessMessage(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Error message (if any) */}
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

          {/* Section content */}
          <div className={styles.sectionContent}>
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
              className={styles.nextButton} /* Keep .nextButton class for styling */
            >
              {isLoading.saveEvent ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        © 2025 Event Tickets Platform
      </div>
    </>
  );
};

export default EventEditPage;