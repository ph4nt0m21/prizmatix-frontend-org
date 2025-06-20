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

// Import API services
import {
  GetEventAPI,
  CreateEventAPI,
  UpdateEventLocationAPI,
  UpdateEventDateTimeAPI,
  UpdateEventDescriptionAPI,
  UploadEventBannerAPI, // Assuming banner/art update uses this
} from '../../services/allApis';

// Import utility functions
import {
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

  // State for event data being edited, using the same "flat" structure as CreateEventPage
  const [eventData, setEventData] = useState({
    id: paramEventId || null,
    name: '',
    eventType: 'public',
    organizerName: '',
    category: '',
    searchTags: [],
    location: {
      isToBeAnnounced: false,
      isPrivateLocation: false,
      googleMapLink: '',
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
    },
    dateTime: {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    },
    description: '',
    art: { // Changed from artData to art for consistency
      thumbnailFile: null,
      thumbnailUrl: null,
      bannerFile: null,
      bannerUrl: null,
    },
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

  const getStepKey = useCallback((stepNum) => stepKeys[stepNum], [stepKeys]);

  // Effect to sync URL param with current step
  useEffect(() => {
    const stepNum = paramStep ? parseInt(paramStep, 10) : 1;
    if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= totalSteps) {
      setCurrentStep(stepNum);
    } else {
      navigate(`/events/edit-page/${paramEventId}/1`, { replace: true });
    }
  }, [paramStep, paramEventId, navigate, totalSteps]);


  // Effect to load initial event data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      if (!paramEventId) {
        setError('No Event ID provided. Please navigate from the Manage Event page.');
        setIsLoading(prev => ({ ...prev, initialLoad: false }));
        return;
      }

      setIsLoading(prev => ({ ...prev, initialLoad: true }));
      try {
        const token = Cookies.get('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await GetEventAPI(paramEventId, token);
        const fetchedData = response.data;

        // --- DATA TRANSFORMATION ---
        // Transform the nested API response to the flat structure our components expect.
        const flatEventData = {
            id: fetchedData.id,
            name: fetchedData.name,
            eventType: fetchedData.private ? 'private' : 'public',
            category: fetchedData.category || '',
            searchTags: fetchedData.searchTags || [],
            organizerName: fetchedData.organization?.name || 'Organizer',

            location: fetchedData.location || eventData.location,
            dateTime: fetchedData.dateTime || eventData.dateTime,
            description: fetchedData.description || '',

            art: {
                thumbnailFile: null,
                thumbnailUrl: fetchedData.thumbnailUrl || null,
                bannerFile: null,
                bannerUrl: fetchedData.bannerUrl || null,
            },
        };
        
        setEventData(flatEventData);
        console.log("Fetched and transformed event data for editing:", flatEventData);
        setError(null);
      } catch (err) {
        console.error("Error fetching event for editing:", err);
        setError('Failed to load event details. Please try again.');
      } finally {
        setIsLoading(prev => ({ ...prev, initialLoad: false }));
      }
    };

    fetchEventData();
  }, [paramEventId, navigate]);


  // Effect to save stepStatus to session storage on changes
  useEffect(() => {
    if (eventData.id) {
      sessionStorage.setItem(`eventEditStepStatus_${eventData.id}`, JSON.stringify(stepStatus));
    }
  }, [stepStatus, eventData.id]);


  /**
   * Universal handler for input changes. Replaces the old handler.
   * This version is compatible with the step components.
   */
  const handleInputChange = useCallback((e, fieldName = null) => {
    const field = fieldName || e.target?.name;
    const value = e.target?.type === "checkbox" ? e.target.checked : e.target?.value ?? e;

    if (['location', 'dateTime', 'art', 'tickets', 'discountCodes', 'searchTags'].includes(field)) {
        setEventData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    } else {
        setEventData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    }

    // Mark current step as visited
    const currentStepKey = getStepKey(currentStep);
    setStepStatus(prevStatus => ({
        ...prevStatus,
        [currentStepKey]: { ...prevStatus[currentStepKey], visited: true },
    }));
  }, [currentStep, getStepKey]);

  /**
   * Validates the current step's data.
   */
  const validateCurrentStep = useCallback(() => {
    const currentStepKey = getStepKey(currentStep);
    let isValid = true;

    switch (currentStepKey) {
      case 'basicInfo':
        // Use the flat state structure for validation
        isValid = !!eventData.name && !!eventData.category;
        break;
      case 'location':
        const loc = eventData.location;
        isValid = loc.isToBeAnnounced || (!!loc.venue && !!loc.street && !!loc.city && !!loc.country);
        break;
      case 'dateTime':
        const dt = eventData.dateTime;
        if (!dt.startDate || !dt.startTime || !dt.endDate || !dt.endTime) {
            isValid = false;
        } else {
            const startDateTime = new Date(`${dt.startDate}T${dt.startTime}`);
            const endDateTime = new Date(`${dt.endDate}T${dt.endTime}`);
            isValid = startDateTime <= endDateTime;
        }
        break;
      case 'description':
        isValid = !!eventData.description?.trim();
        break;
      case 'art':
        const art = eventData.art;
        // Art is optional, so it's always "valid" to proceed.
        // Or, if an image is required for an edited event:
        isValid = !!art.thumbnailUrl && !!art.bannerUrl;
        break;
      default:
        isValid = true;
    }

    setStepStatus(prevStatus => ({
      ...prevStatus,
      [currentStepKey]: { ...prevStatus[currentStepKey], valid: isValid, visited: true },
    }));
    return isValid;
  }, [currentStep, eventData, getStepKey]);

  const handlePrevStep = () => {
    if (currentStep > 1) {
      navigate(`/events/edit-page/${paramEventId}/${currentStep - 1}`);
    }
  };

  /**
   * Handles saving the current step's data via API call.
   */
  const handleSaveStep = async () => {
    const currentStepKey = getStepKey(currentStep);
    if (!validateCurrentStep()) {
      setError('Please fill out all required fields correctly.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(prev => ({ ...prev, saveEvent: true }));

    try {
      let response;
      const token = Cookies.get('token'); // Assuming token is needed for updates
      if (!token) navigate('/login');

      // Each case prepares data and calls the appropriate update API
      switch (currentStepKey) {
        case 'basicInfo':
            // Basic info is often part of other updates, but if there's a specific endpoint:
            const basicInfoPayload = {
                id: eventData.id,
                name: eventData.name,
                private: eventData.eventType === 'private',
                category: eventData.category,
                //... any other basic info fields
            };
            response = await CreateEventAPI(eventData.id, basicInfoPayload, token);
            break;
        case 'location':
            const locationPayload = prepareLocationDataForAPI(eventData.location);
            response = await UpdateEventLocationAPI(eventData.id, locationPayload, token);
            break;
        case 'dateTime':
            const dateTimePayload = prepareDateTimeDataForAPI(eventData.dateTime, eventData.id);
            response = await UpdateEventDateTimeAPI(eventData.id, dateTimePayload, token);
            break;
        case 'description':
            const descriptionPayload = prepareDescriptionDataForAPI(eventData.description, eventData.id);
            response = await UpdateEventDescriptionAPI(eventData.id, descriptionPayload, token);
            break;
        case 'art':
            // Art/image upload is often a multipart/form-data request.
            // Using the banner upload API as an example.
            if (eventData.art.bannerFile) {
                const artPayload = prepareArtDataForAPI(eventData.art, eventData.id, "banner");
                response = await UploadEventBannerAPI(eventData.id, artPayload, token); // This might need FormData
            }
            break;
        default:
            throw new Error("Invalid save step");
      }
      
      setStepStatus(prev => ({
        ...prev,
        [currentStepKey]: { ...prev[currentStepKey], completed: true, valid: true },
      }));
      setSuccessMessage(`${currentStepKey.charAt(0).toUpperCase() + currentStepKey.slice(1)} updated successfully!`);
      
      if (currentStep < totalSteps) {
        navigate(`/events/edit-page/${paramEventId}/${currentStep + 1}`);
      } else {
        // Last step, navigate to overview or manage page
        setTimeout(() => {
            navigate(`/events/manage/${eventData.id}/overview`);
        }, 1500);
      }

    } catch (err) {
      console.error(`Error updating ${currentStepKey}:`, err);
      setError(`Failed to update ${currentStepKey}. Please try again.`);
      setStepStatus(prev => ({
        ...prev,
        [currentStepKey]: { ...prev[currentStepKey], completed: false },
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, saveEvent: false }));
    }
  };

  const renderCurrentStep = useCallback(() => {
    const currentStepKey = getStepKey(currentStep);
    // The props are now compatible with the step components
    const stepProps = {
      eventData: eventData,
      handleInputChange: handleInputChange,
      isValid: stepStatus[currentStepKey]?.valid || false,
      stepStatus: stepStatus[currentStepKey],
    };

    switch (currentStep) {
      case 1: return <BasicInfoStep {...stepProps} />;
      case 2: return <LocationStep {...stepProps} />;
      case 3: return <DateTimeStep {...stepProps} />;
      case 4: return <DescriptionStep {...stepProps} />;
      case 5: return <ArtStep {...stepProps} />; // ArtStep expects `eventData.art` which is now correct
      default: return <div>Unknown Step</div>;
    }
  }, [currentStep, eventData, handleInputChange, stepStatus, getStepKey]);

  if (isLoading.initialLoad) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading event details for editing...</p>
      </div>
    );
  }

  if (error && !eventData.id) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    );
  }

  return (
    <>
      <EventHeaderNav
        currentStep={`Edit ${getStepKey(currentStep)}`}
        eventName={eventData.name || 'Loading Event...'}
        isDraft={false}
        canPreview={true}
        context="edit"
        eventId={paramEventId}
      />
      <div className={styles.content}>
        <EditEventSidebar
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={(step) => navigate(`/events/edit-page/${paramEventId}/${step}`)}
          eventId={paramEventId}
        />
        <div className={styles.mainContent}>
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
              <button className={styles.dismissButton} onClick={() => setSuccessMessage(null)}>✕</button>
            </div>
          )}
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button className={styles.dismissButton} onClick={() => setError(null)}>✕</button>
            </div>
          )}
          <div className={styles.sectionContent}>
            {renderCurrentStep()}
          </div>
          <div className={styles.navigation}>
            <button type="button" onClick={handlePrevStep} disabled={currentStep === 1} className={styles.backButton}>
              Back
            </button>
            <button type="button" onClick={handleSaveStep} disabled={isLoading.saveEvent} className={styles.nextButton}>
              {isLoading.saveEvent ? 'Saving...' : (currentStep === totalSteps ? 'Save and Finish' : 'Save and Continue')}
            </button>
          </div>
        </div>
      </div>
      <div className={styles.footer}>© 2025 Event Tickets Platform</div>
    </>
  );
};

export default EventEditPage;