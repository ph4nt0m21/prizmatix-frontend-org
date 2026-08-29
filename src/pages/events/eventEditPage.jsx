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
  GetEventStatusAPI,
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
  mapEventApiPayloadToLocationForm,
  isEventLocationComplete,
  getLocationStepMissingFieldLabels,
} from '../../utils/eventUtil';
import { mapApiDateTimeToFormDateTime } from '../../utils/datetimeUtil';
import { getUserData } from '../../utils/authUtil';
import { getPublishedEventTimingStatus, ENDED_PUBLISHED_EVENT_SCHEDULE_MESSAGE } from './eventStatusUtils';

const normalizeApiTime = (timeValue) => {
  if (!timeValue) return '';
  if (typeof timeValue === 'string') {
    const trimmed = timeValue.trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed.slice(0, 5);
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const h = String(parsed.getHours()).padStart(2, '0');
      const m = String(parsed.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return trimmed.slice(0, 5);
  }
  if (typeof timeValue === 'object') {
    const hour = String(timeValue.hour ?? '').padStart(2, '0');
    const minute = String(timeValue.minute ?? '').padStart(2, '0');
    if (hour.trim() && minute.trim()) return `${hour}:${minute}`;
  }
  return '';
};

const getFileNameFromUrl = (urlValue) => {
  if (!urlValue || typeof urlValue !== 'string') return null;
  try {
    const pathname = new URL(urlValue).pathname || '';
    const fileName = pathname.split('/').pop();
    return fileName || null;
  } catch {
    const fileName = urlValue.split('?')[0].split('/').pop();
    return fileName || null;
  }
};

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
  /** Published events that had already ended when loaded — schedule cannot be changed. */
  const [scheduleLocked, setScheduleLocked] = useState(false);

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
        const [response, statusResponse] = await Promise.all([
          GetEventAPI(paramEventId),
          GetEventStatusAPI(paramEventId),
        ]);
        const fetchedData = response.data;
        const isPublished = statusResponse.data?.step8Completed ?? false;

        // --- CORRECTED: Data transformation now matches the provided API response ---
        const transformedData = {
          id: fetchedData.id,
          name: fetchedData.name,
          slug: fetchedData.slug,
          isPublished,
          eventType: fetchedData.isPrivate ? 'private' : 'public',
          refundPolicy: fetchedData.refundPolicy || 'NO_POLICY',
          customRefundPolicyText: fetchedData.customRefundPolicyText || '',
          organizerName: fetchedData.organizationName || 'Organiser',
          category: fetchedData.category || '',
          searchTags: fetchedData.keywords ? fetchedData.keywords.split(',').map(tag => tag.trim()) : [],
          
          location: mapEventApiPayloadToLocationForm(fetchedData),
          
          dateTime: mapApiDateTimeToFormDateTime(
            {
              startDate: fetchedData.dateTime?.startDate || fetchedData.startDate || '',
              startTime: fetchedData.dateTime?.startTime || fetchedData.startTime,
              endDate: fetchedData.dateTime?.endDate || fetchedData.endDate || '',
              endTime: fetchedData.dateTime?.endTime || fetchedData.endTime,
              timezone:
                fetchedData.dateTime?.timezone ||
                fetchedData.timezone ||
                fetchedData.timeZone,
            },
            {}
          ),
          endDate: fetchedData.endDate || '',
          endTime: normalizeApiTime(fetchedData.endTime),
          description: fetchedData.description || '',
          art: {
            thumbnailFile: null,
            bannerFile: null,
            thumbnailUrl:
              fetchedData.thumbnailImage ||
              fetchedData.art?.thumbnailUrl ||
              null,
            bannerUrl:
              fetchedData.bannerImage ||
              fetchedData.art?.bannerUrl ||
              null,
            thumbnailName: getFileNameFromUrl(
              fetchedData.thumbnailImage || fetchedData.art?.thumbnailUrl
            ),
            bannerName: getFileNameFromUrl(
              fetchedData.bannerImage || fetchedData.art?.bannerUrl
            ),
          },
        };
        
        setEventData(transformedData);
        setScheduleLocked(
          isPublished &&
            getPublishedEventTimingStatus(transformedData) === 'PAST'
        );
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
    setEventData(prevData => {
      const next = { ...prevData, [fieldName]: value };
      if (fieldName === 'dateTime' && value && typeof value === 'object') {
        next.endDate = value.endDate ?? prevData.endDate;
        next.endTime = value.endTime ?? prevData.endTime;
        next.startDate = value.startDate ?? prevData.startDate;
        next.startTime = value.startTime ?? prevData.startTime;
      }
      return next;
    });
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
        isValid = isEventLocationComplete(eventData);
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
    const currentStepKey = getStepKey(currentStep);

    if (scheduleLocked && currentStepKey === 'dateTime') {
      setError(ENDED_PUBLISHED_EVENT_SCHEDULE_MESSAGE);
      return;
    }

    const isStepValid = validateCurrentStep();
    if (!isStepValid) {
      const currentStepKey = getStepKey(currentStep);
      setStepStatus((prev) => ({
        ...prev,
        [currentStepKey]: { ...prev[currentStepKey], visited: true },
      }));
      if (currentStepKey === 'location') {
        const missing = getLocationStepMissingFieldLabels(eventData);
        setError(
          missing.length
            ? `Please add: ${missing.join(', ')}.`
            : 'Please fill out all required location fields before continuing.'
        );
      } else {
        setError('Please fill out all required fields correctly before continuing.');
      }
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(prev => ({ ...prev, saveEvent: true }));

    try {
      // Use a switch to call the correct update API for the current step
      switch (currentStepKey) {
        case 'basicInfo': {
          const payload = prepareDescriptionDataForAPI(eventData.description, eventData.id, eventData.eventType === 'private');
          payload.name = eventData.name; // Add name to the payload
          payload.refundPolicy = eventData.refundPolicy;
          payload.customRefundPolicyText =
            eventData.refundPolicy === 'CUSTOM' ? eventData.customRefundPolicyText : null;
          await UpdateEventDescriptionAPI(eventData.id, payload);
          break;
        }
        case 'location': {
          const payload = prepareLocationDataForAPI(eventData.location, eventData.id);
          await UpdateEventLocationAPI(eventData.id, payload);
          break;
        }
        case 'dateTime': {
          const payload = prepareDateTimeDataForAPI(eventData.dateTime, eventData.id);
          await UpdateEventDateTimeAPI(eventData.id, payload);
          const syncedDateTime = mapApiDateTimeToFormDateTime(
            {
              startDate: payload.startDate,
              startTime: payload.startTime,
              endDate: payload.endDate,
              endTime: payload.endTime,
              timezone: payload.timeZone,
            },
            eventData.dateTime
          );
          setEventData((prev) => ({
            ...prev,
            dateTime: syncedDateTime,
            endDate: payload.endDate,
            endTime: payload.endTime,
            startDate: payload.startDate,
            startTime: payload.startTime,
          }));
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
            const userData = getUserData();
            if (userData?.id != null) {
              formData.append("updatedBy", userData.id);
            }
            if (artData.bannerFile) formData.append("bannerFile", artData.bannerFile);
            if (artData.thumbnailFile) formData.append("thumbnailFile", artData.thumbnailFile);
            await UploadEventBannerAPI(eventData.id, formData);
            const refreshResponse = await GetEventAPI(eventData.id);
            const r = refreshResponse?.data || {};
            setEventData((prev) => ({
              ...prev,
              art: {
                ...prev.art,
                thumbnailFile: null,
                bannerFile: null,
                thumbnailUrl:
                  r.thumbnailImage ||
                  r.art?.thumbnailUrl ||
                  prev.art?.thumbnailUrl ||
                  null,
                bannerUrl:
                  r.bannerImage ||
                  r.art?.bannerUrl ||
                  prev.art?.bannerUrl ||
                  null,
                thumbnailName: getFileNameFromUrl(
                  r.thumbnailImage || r.art?.thumbnailUrl
                ),
                bannerName: getFileNameFromUrl(
                  r.bannerImage || r.art?.bannerUrl
                ),
              },
            }));
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
      setError(
        err.response?.data?.message ||
          (scheduleLocked && currentStepKey === 'dateTime'
            ? ENDED_PUBLISHED_EVENT_SCHEDULE_MESSAGE
            : `Failed to update ${currentStepKey}. Please try again.`)
      );
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
      case 3:
        return (
          <DateTimeStep
            {...stepProps}
            scheduleLocked={scheduleLocked}
            lockMessage={ENDED_PUBLISHED_EVENT_SCHEDULE_MESSAGE}
          />
        );
      case 4: return <DescriptionStep {...stepProps} />;
      case 5: return <ArtStep {...stepProps} />;
      default: return <div>Unknown Step</div>;
    }
  }, [currentStep, eventData, handleInputChange, stepStatus, getStepKey, scheduleLocked]);

  if (isLoading.initialLoad) {
    return <div className={styles.loadingContainer}><LoadingSpinner size="large" /><p>Loading Event Editor...</p></div>;
  }

  if (error && !eventData.id) {
    return <div className={styles.errorContainer}><p>{error}</p><button onClick={() => navigate('/events')}>Back to Events</button></div>;
  }

  const eventStatus = eventData.isPublished
    ? getPublishedEventTimingStatus(eventData)
    : 'DRAFT';

  return (
    <div className={styles.pageContainer}>
      <EventHeaderNav
        currentStep={`Edit ${getStepKey(currentStep)}`}
        eventName={eventData.name || 'Loading Event...'}
        context="edit"
        eventId={paramEventId}
        eventSlug={eventData.slug}
        isDraft={!eventData.isPublished}
        eventStatus={eventStatus}
        toggleMobileSidebar={toggleEditSidebar} // Pass the local toggle function to EventHeaderNav
      />
      <div className={styles.content}>
        {/* Overlay for mobile sidebar */}
        {isEditSidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={toggleEditSidebar}></div>
        )}
        {/* EditEventSidebar now uses local state */}
        <EditEventSidebar
          currentStep={currentStep}
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
            <button type="button" onClick={handlePrevStep} disabled={currentStep === 1} className={styles.backButton}>
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveStep}
              disabled={
                isLoading.saveEvent ||
                (scheduleLocked && getStepKey(currentStep) === 'dateTime')
              }
              className={styles.nextButton}
            >
              {isLoading.saveEvent ? 'Saving...' : (currentStep === totalSteps ? 'Save and Finish' : 'Save and Continue')}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventEditPage;