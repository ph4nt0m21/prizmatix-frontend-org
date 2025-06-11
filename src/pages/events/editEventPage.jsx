import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../layout/header/header';
import EventHeaderNav from './components/eventHeaderNav'; // Reuse EventHeaderNav
import EventEditSidebar from './components/eventEditSidebar'; // The specific sidebar for editing
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './editEventPage.module.scss';
import { GetEventAPI } from '../../services/allApis'; // API to fetch event data

// Import edit step components
// Assuming basicInfoStep.jsx is placed under pages/events/editSteps/
import BasicInfoStep from './editSteps/basicInfoStep';
import LocationStep from './editSteps/locationStep';
import DateTimeStep from './editSteps/dateTimeStep';
import DescriptionStep from './editSteps/descriptionStep';
import ArtStep from './editSteps/artStep';

const EditEventPage = () => {
  const { eventId, step } = useParams(); // Get eventId and step from URL
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Default to step 1
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define step components that are part of the editing flow
  const stepComponents = {
    1: BasicInfoStep,
    2: LocationStep,
    3: DateTimeStep,
    4: DescriptionStep,
    5: ArtStep,
    // Exclude Tickets, Discount Codes, and Publish steps as requested
  };

  // Maps numerical step to a descriptive name for EventHeaderNav
  const stepNames = {
    1: 'Basic Info',
    2: 'Location',
    3: 'Date & Time',
    4: 'Description',
    5: 'Thumbnail & Banner',
  };

  useEffect(() => {
    // Parse step from URL, default to 1 if not provided or invalid
    const stepNumber = parseInt(step, 10);
    if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= Object.keys(stepComponents).length) {
      setCurrentStep(stepNumber);
    } else {
      setCurrentStep(1); // Redirect to step 1 if invalid step in URL
      navigate(`/events/edit/${eventId}/1`, { replace: true });
    }

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await GetEventAPI(eventId); // Fetch event data using the eventId
        if (response.success) {
          setEventData(response.data);
          // Set initial values for step-specific data if necessary
        } else {
          setError(response.message || 'Failed to fetch event data.');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Error fetching event data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    } else {
      setError('Event ID is missing.');
      setIsLoading(false);
    }
  }, [eventId, step, navigate]); // Depend on eventId and step changes

  // Handler for input changes in step components
  // This function will be passed down to each step component
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prevData => {
      if (!prevData) return null; // Defensive check

      // Handle direct property updates for basic info
      return {
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  // For complex nested objects (like location, date/time), you might need specific handlers
  // or a more sophisticated generic handler. For now, assuming basicInfoStep uses flat properties.
  // Example for nested:
  // const handleNestedInputChange = (sectionName, fieldName, value) => {
  //   setEventData(prevData => ({
  //     ...prevData,
  //     [sectionName]: {
  //       ...prevData[sectionName],
  //       [fieldName]: value
  //     }
  //   }));
  // };

  // Placeholder for validity state (can be implemented later for actual validation per step)
  const isValidStep = true; // For now, assume step is always valid for editing purposes

  // Placeholder for step status (e.g., 'completed', 'active')
  const stepStatus = {}; // For simplicity in edit, can be expanded if needed

  const goToPrevious = () => {
    if (currentStep > 1) {
      navigate(`/events/edit/${eventId}/${currentStep - 1}`);
    }
  };

  const goToNext = () => {
    if (currentStep < Object.keys(stepComponents).length) {
      navigate(`/events/edit/${eventId}/${currentStep + 1}`);
    }
    // You might want to save data on "Next" button click here
  };

  // Renders the component for the current step
  const renderCurrentSection = () => {
    const StepComponent = stepComponents[currentStep];
    if (!StepComponent || !eventData) {
      return (
        <div className={styles.placeholderContainer}>
          <LoadingSpinner size="small" />
          <p>Loading section data...</p>
        </div>
      );
    }
    return (
      <StepComponent
        eventData={eventData}
        handleInputChange={handleInputChange} // Pass the generic handler
        isValid={isValidStep} // Pass validity state
        stepStatus={stepStatus} // Pass step status
        // If BasicInfoStep expects `setEventData` for complex updates, you can pass it too
        // setEventData={setEventData}
      />
    );
  };

  if (isLoading || !eventData) { // Check eventData as well for initial load
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => navigate('/events')}>Go to Events</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <EventHeaderNav
        currentStep={`Edit: ${stepNames[currentStep] || 'Unknown Step'}`}
        eventName={eventData.name}
        isDraft={eventData.status !== 'Live'} // Example: consider draft if not 'Live'
        canPreview={true} // Assume preview is generally available during editing
      />
      <div className={styles.content}>
        <EventEditSidebar
          currentStep={currentStep}
          navigateToStep={(s) => navigate(`/events/edit/${eventId}/${s}`)}
          eventId={eventId} // Pass eventId if sidebar needs it (e.g., for status check)
        />
        <div className={styles.mainContent}>
          {renderCurrentSection()}
          <div className={styles.navigation}>
            <button
              onClick={goToPrevious}
              disabled={currentStep === 1}
              className={styles.backButton}
            >
              Back
            </button>
            <button
              onClick={goToNext}
              disabled={currentStep === Object.keys(stepComponents).length}
              className={styles.nextButton}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        © 2025 Event Tickets Platform
      </div>
    </>
  );
};

export default EditEventPage;