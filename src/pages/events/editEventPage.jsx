import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../layout/header/header';
import EventHeaderNav from './components/eventHeaderNav';
import EventEditSidebar from './components/eventEditSidebar';
import BasicInfoStep from './editSteps/basicInfoStep';
import LocationStep from './editSteps/locationStep';
import DateTimeStep from './editSteps/dateTimeStep';
import DescriptionStep from './editSteps/descriptionStep';
import ArtStep from './editSteps/artStep';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './editEventPage.module.scss';
import { GetEventAPI } from '../../services/allApis';

const EditEventPage = () => {
  const { eventId, step } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const stepComponents = {
    1: BasicInfoStep,
    2: LocationStep,
    3: DateTimeStep,
    4: DescriptionStep,
    5: ArtStep
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const response = await GetEventAPI(eventId);
        setEventData(response.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to fetch event data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const stepNum = parseInt(step);
    if (stepNum >= 1 && stepNum <= 5) {
      setCurrentStep(stepNum);
    } else {
      navigate(`/events/edit/${eventId}/1`);
    }
  }, [step, eventId, navigate]);

  const StepComponent = stepComponents[currentStep];

  const goToNext = () => {
    if (currentStep < 5) {
      navigate(`/events/edit/${eventId}/${currentStep + 1}`);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      navigate(`/events/edit/${eventId}/${currentStep - 1}`);
    }
  };

  if (isLoading || !eventData) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <EventHeaderNav 
        currentStep={`Edit Step ${currentStep}`} 
        eventName={eventData.name} 
        isDraft={true} 
        canPreview={true} 
      />
      <div className={styles.content}>
        <
  currentStep={currentStep}
  navigateToStep={(s) => navigate(`/events/edit/${eventId}/${s}`)}
  eventId={eventId}
/>
        <div className={styles.mainContent}>
          {StepComponent && (
            <StepComponent
              eventData={eventData}
              setEventData={setEventData}
            />
          )}
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
              disabled={currentStep === 5}
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
