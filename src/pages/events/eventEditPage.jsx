import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'; // Import useOutletContext
import Cookies from 'js-cookie';

// Import Page Components
import EventHeaderNav from './components/eventHeaderNav';
import EditEventSidebar from './components/editEventSidebar';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './eventEditPage.module.scss';

// Import Reusable Step Components
import BasicInfoStep from './steps/basicInfoStep';
import LocationStep from './steps/locationStep';
import DateTimeStep from './steps/dateTimeStep';
import DescriptionStep from './steps/descriptionStep';
import ArtStep from './steps/artStep';

// Import API Services
import {
  GetEventAPI,
  UpdateEventLocationAPI,
  UpdateEventDateTimeAPI,
  UpdateEventDescriptionAPI,
  UploadEventBannerAPI,
} from '../../services/allApis';

// Import Utility Functions
import {
  prepareLocationDataForAPI,
  prepareDateTimeDataForAPI,
  prepareDescriptionDataForAPI,
} from '../../utils/eventUtil';

/**
 * EventEditPage component for editing existing event details in a multi-step flow.
 * Now includes local state and logic for its own mobile sidebar.
 */
const EventEditPage = () => {
  const { eventId: paramEventId, step: paramStep } = useParams();
  const navigate = useNavigate();
  // We don't directly use toggleGlobalSideNavBar here, as this page manages its own sidebar
  const { } = useOutletContext(); // Destructure to avoid unused variable warning if nothing else is needed


  // State for current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Basic Info, Location, Date & Time, Description, Art

  // NEW: Local state for this page's sidebar visibility
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);

  // NEW: Local toggle function for this page's sidebar
  const toggleEditSidebar = () => {
    setIsEditSidebarOpen(!isEditSidebarOpen);
  };

  // Main state for all event data being edited
  const [eventData, setEventData] = useState({
    id: paramEventId || null,
    name: '',
    eventType: 'public',
    organizerName: '',
    category: '',
    searchTags: [],
    location: {},
    dateTime: {},
    description: '',
    art: {},
  });

  // State for step validity and visited status for UI feedback
  const [stepStatus, setStepStatus] = useState({
    basicInfo: { completed: false, valid: false, visited: false },
    location: { completed: false, valid: false, visited: false },
    dateTime: { completed: false, valid: false, visited: false },
    description: { completed: false, valid: false, visited: false },
    art: { completed: false, valid: false, visited: false },
  });

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState({ initialLoad: true, saveEvent: false });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Map step numbers to their keys for status tracking
  const stepKeys = { 1: 'basicInfo', 2: 'location', 3: 'dateTime', 4: 'description', 5: 'art' };
  const getStepKey = useCallback((stepNum) => stepKeys[stepNum], [stepKeys]);

  // Effect to sync URL param with current step
  useEffect(() => {
    const stepNum = paramStep ? parseInt(paramStep, 10) : 1;
    if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= totalSteps) {
      setCurrentStep(stepNum);
    } else if (paramEventId) {
      navigate(`/events/edit-page/${paramEventId}/1`, { replace: true });
    }
  }, [paramStep, paramEventId, navigate, totalSteps]);

  // Effect to load initial event data from the API on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      if (!paramEventId) {
        setError('No Event ID provided. Please navigate from the Manage Event page.');
        setIsLoading(prev => ({ ...prev, initialLoad: false }));
        return;
      }

      setIsLoading(prev => ({ ...prev, initialLoad: true }));
      try {
        const response = await GetEventAPI(paramEventId);
        const fetchedData = response.data;

        // --- CORRECTED: Data transformation now matches the provided API response ---
        const transformedData = {
          id: fetchedData.id,
          name: fetchedData.name,
          eventType: fetchedData.isPrivate ? 'private' : 'public',
          organizerName: fetchedData.organizationName || 'Organizer',
          category: fetchedData.category || '',
          searchTags: fetchedData.keywords ? fetchedData.keywords.split(',').map(tag => tag.trim()) : [],
          
          location: {
            // The API response does not provide full address details, so we map what's available.
            locationType: fetchedData.eventLocationType || 'physical',
            isToBeAnnounced: fetchedData.eventLocationType === 'tba',
            venue: fetchedData.eventLocationName || '', // Use eventLocationName for the venue
            // Other fields are not provided by this API, so they will be empty initially.
            street: '',
            streetNumber: '',
            city: '',
            postalCode: '',
            state: '',
            country: '',
            googleMapLink: '',
            additionalInfo: '',
            latitude: '',
            longitude: '',
          },
          
          dateTime: {
            startDate: fetchedData.startDate || '',
            startTime: fetchedData.startTime || '',
            endDate: fetchedData.endDate || '',
            endTime: fetchedData.endTime || '',
          },
          description: fetchedData.description || '',
          art: {
            thumbnailFile: null,
            bannerFile: null,
            thumbnailUrl: null, // thumbnailUrl is not in the API response
            bannerUrl: fetchedData.bannerImage || null, // API provides a full URL for bannerImage
          },
        };
        
        setEventData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching event for editing:", err);
        setError('Failed to load event details. Please try again.');
      } finally {
        setIsLoading(prev => ({ ...prev, initialLoad: false }));
      }
    };
    fetchEventData();
  }, [paramEventId]);

  // Universal handler for input changes from child step components
  const handleInputChange = useCallback((value, fieldName) => {
    setEventData(prevData => ({ ...prevData, [fieldName]: value }));
    const currentStepKey = getStepKey(currentStep);
    setStepStatus(prevStatus => ({
      ...prevStatus,
      [currentStepKey]: { ...prevStatus[currentStepKey], visited: true },
    }));
  }, [currentStep, getStepKey]);

  // --- VALIDATION LOGIC ---
  const validateCurrentStep = useCallback(() => {
    const currentStepKey = getStepKey(currentStep);
    let isValid = false;

    switch (currentStepKey) {
      case 'basicInfo':
        isValid = !!eventData.name?.trim();
        break;
      case 'location':
        const loc = eventData.location;
        isValid = loc?.isToBeAnnounced || (!!loc?.venue); // Simplified validation since we only have venue name
        break;
      case 'dateTime':
        const dt = eventData.dateTime;
        if (!dt?.startDate || !dt?.startTime || !dt?.endDate || !dt?.endTime) {
            isValid = false;
        } else {
            const startDateTime = new Date(`${dt.startDate}T${dt.startTime}`);
            const endDateTime = new Date(`${dt.endDate}T${dt.endTime}`);
            isValid = endDateTime > startDateTime;
        }
        break;
      case 'description':
        isValid = !!eventData.description?.trim();
        break;
      case 'art':
        // Art is optional, so it's always considered valid to proceed.
        isValid = true;
        break;
      default:
        isValid = false;
    }
    
    setStepStatus(prev => ({ ...prev, [currentStepKey]: { ...prev[currentStepKey], valid: isValid }}));
    return isValid;
  }, [currentStep, eventData, getStepKey]);

  // --- NAVIGATION AND SAVING ---
  const handlePrevStep = () => {
    if (currentStep > 1) {
      navigate(`/events/edit-page/${paramEventId}/${currentStep - 1}`);
    }
  };

  const handleSaveStep = async () => {
    if (!validateCurrentStep()) {
      setError('Please fill out all required fields correctly before continuing.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(prev => ({ ...prev, saveEvent: true }));

    const currentStepKey = getStepKey(currentStep);

    try {
      // Use a switch to call the correct update API for the current step
      switch (currentStepKey) {
        case 'basicInfo': {
          const payload = prepareDescriptionDataForAPI(eventData.description, eventData.id, eventData.eventType === 'private');
          payload.name = eventData.name; // Add name to the payload
          await UpdateEventDescriptionAPI(eventData.id, payload);
          break;
        }
        case 'location': {
          const payload = prepareLocationDataForAPI(eventData.location);
          await UpdateEventLocationAPI(eventData.id, payload);
          break;
        }
        case 'dateTime': {
          const payload = prepareDateTimeDataForAPI(eventData.dateTime, eventData.id);
          await UpdateEventDateTimeAPI(eventData.id, payload);
          break;
        }
        case 'description': {
          const payload = prepareDescriptionDataForAPI(eventData.description, eventData.id, eventData.eventType === 'private');
          await UpdateEventDescriptionAPI(eventData.id, payload);
          break;
        }
        case 'art': {
          const artData = eventData.art;
          if (artData?.thumbnailFile || artData?.bannerFile) {
            const formData = new FormData();
            formData.append("id", eventData.id);
            if (artData.bannerFile) formData.append("bannerFile", artData.bannerFile);
            if (artData.thumbnailFile) formData.append("thumbnailFile", artData.thumbnailFile);
            await UploadEventBannerAPI(eventData.id, formData);
          }
          break;
        }
        default:
          throw new Error("Invalid save step");
      }
      
      setStepStatus(prev => ({ ...prev, [currentStepKey]: { ...prev[currentStepKey], completed: true } }));
      setSuccessMessage(`${currentStepKey.charAt(0).toUpperCase() + currentStepKey.slice(1)} updated successfully!`);
      
      // Navigate to the next step or finish
      if (currentStep < totalSteps) {
        navigate(`/events/edit-page/${paramEventId}/${currentStep + 1}`);
      } else {
        setTimeout(() => navigate(`/events/manage/${paramEventId}/overview`), 1500);
      }

    } catch (err) {
      console.error(`Error updating ${currentStepKey}:`, err);
      setError(err.response?.data?.message || `Failed to update ${currentStepKey}. Please try again.`);
    } finally {
      setIsLoading(prev => ({ ...prev, saveEvent: false }));
    }
  };

  // --- COMPONENT RENDERING ---
  const renderCurrentStep = useCallback(() => {
    const stepProps = {
      eventData: eventData,
      handleInputChange: handleInputChange,
      isValid: stepStatus[getStepKey(currentStep)]?.valid || false,
      stepStatus: stepStatus[getStepKey(currentStep)],
    };

    switch (currentStep) {
      case 1: return <BasicInfoStep {...stepProps} />;
      case 2: return <LocationStep {...stepProps} />;
      case 3: return <DateTimeStep {...stepProps} />;
      case 4: return <DescriptionStep {...stepProps} />;
      case 5: return <ArtStep {...stepProps} />;
      default: return <div>Unknown Step</div>;
    }
  }, [currentStep, eventData, handleInputChange, stepStatus, getStepKey]);

  if (isLoading.initialLoad) {
    return <div className={styles.loadingContainer}><LoadingSpinner size="large" /><p>Loading Event Editor...</p></div>;
  }

  if (error && !eventData.id) {
    return <div className={styles.errorContainer}><p>{error}</p><button onClick={() => navigate('/events')}>Back to Events</button></div>;
  }

  return (
    <>
      <EventHeaderNav
        currentStep={`Edit ${getStepKey(currentStep)}`}
        eventName={eventData.name || 'Loading Event...'}
        context="edit"
        eventId={paramEventId}
        toggleMobileSidebar={toggleEditSidebar} // Pass the local toggle function to EventHeaderNav
      />
      <div className={styles.content}>
        {/* EditEventSidebar now uses local state */}
        <EditEventSidebar
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={(step) => {
            navigate(`/events/edit-page/${paramEventId}/${step}`);
            if (window.innerWidth <= 768 && isEditSidebarOpen) { // Close sidebar on navigation
              toggleEditSidebar();
            }
          }}
          eventId={paramEventId}
          isMobileSidebarOpen={isEditSidebarOpen} // Pass local state
          toggleMobileSidebar={toggleEditSidebar} // Pass local toggle for closing
        />
        <main className={styles.mainContent}>
          {successMessage && <div className={styles.successMessage}>{successMessage}<button onClick={() => setSuccessMessage(null)}>✕</button></div>}
          {error && <div className={styles.errorMessage}>{error}<button onClick={() => setError(null)}>✕</button></div>}
          
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
        </main>
      </div>
      <div className={styles.footer}>© 2025 Event Tickets Platform</div>
    </>
  );
};

export default EventEditPage;