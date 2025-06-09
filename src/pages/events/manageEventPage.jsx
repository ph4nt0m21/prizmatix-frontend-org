import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventHeaderNav from './components/eventHeaderNav';
import EventManageSidebar from './components/eventManageSidebar';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './manageEventPage.module.scss';

// Import section components
import OverviewSection from './sections/overviewSection';
import OrdersAndAttendeesSection from './sections/ordersAndAttendeesSection';
import PayoutSection from './sections/payoutSection';
import PromotionsSection from './sections/promotionsSection';
import EventPageSection from './sections/eventPageSection'; // This is likely the placeholder component

/**
 * EventManagePage component for managing existing events
 * Provides a dashboard view with metrics and management options
 */
const EventManagePage = () => {
  const navigate = useNavigate();
  const { eventId, section } = useParams();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Error state
  const [error, setError] = useState(null);

  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);

  // Event data state with dummy values (replace with actual API fetch)
  const [eventData, setEventData] = useState({
    id: eventId || '12345',
    name: 'NORR Festival 2022',
    status: 'Live',
    location: {
      city: 'Queenstown',
      venue: 'Skyline Gondola'
    },
    dateTime: {
      startDate: '2025-07-10',
      startTime: '18:00',
      endDate: '2025-07-10',
      endTime: '22:00'
    },
    description: 'A vibrant music and arts festival.',
    bannerImageUrl: 'https://example.com/banner.jpg',
    thumbnailImageUrl: 'https://example.com/thumbnail.jpg',
    tickets: {
      total: 500,
      issued: 250,
      paid: 200,
      free: 50
    },
    orders: {
      count: 100,
      totalRevenue: 5000,
      grossRevenue: 5500 // Assuming some fees included in total but not net
    },
    payout: {
      status: 'Pending',
      amount: 4500,
      lastPayoutDate: '2025-06-01'
    },
    promotions: {
      active: true,
      count: 5
    }
  });

  const [isEventLive, setIsEventLive] = useState(true); // Assuming 'Live' status means it's not a draft
  const [canPreview, setCanPreview] = useState(true); // Assuming preview is always available

  useEffect(() => {
    // In a real application, you'd fetch event data here
    // For now, simulating loading
    setTimeout(() => {
      setIsLoading(false);
      // setEventData(fetchedEventData); // Set real data
      // setIsEventLive(fetchedEventData.status === 'Live');
      // setCanPreview(fetchedEventData.status !== 'Draft'); // Example logic
    }, 500);
  }, [eventId]);

  /**
   * Navigates to a specific section within the manage event page,
   * or to the edit event page if 'eventPage' section is selected.
   * @param {string} sectionKey - The key of the section to navigate to.
   */
  const navigateToSection = (sectionKey) => {
    if (sectionKey === 'eventPage') {
      // Navigate to EditEventPage, starting at Basic Info (step 1)
      navigate(`/events/edit/${eventId}/1`);
    } else {
      // Navigate to other sections within manageEventPage
      navigate(`/events/manage/${eventId}/${sectionKey}`);
    }
  };

  const sectionStatus = {}; // You can implement real status logic here

  // Renders the component for the current section
  const renderCurrentSection = () => {
    switch (section) {
      case 'overview':
        return <OverviewSection eventData={eventData} />;
      case 'ordersAndAttendees':
        return <OrdersAndAttendeesSection eventData={eventData} />;
      case 'payouts':
        return <PayoutSection eventData={eventData} />;
      case 'promotions':
        return <PromotionsSection eventData={eventData} />;
      case 'eventPage':
        // This section will now mostly serve as a navigation point in the sidebar.
        // The actual editing will happen on the /events/edit/:eventId/:step route.
        // You might keep this as a fallback or remove if not strictly needed.
        return <EventPageSection title="Event Page Details" description="This section allows you to manage aspects of your event page." />;
      default:
        return <OverviewSection eventData={eventData} />; // Default to Overview
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading event management page...</p>
      </div>
    );
  }

  return (
    <>
      {/* Event Header Nav for the manage event page */}
      <EventHeaderNav
        currentStep={section || 'Overview'}
        eventName={eventData.name}
        isDraft={!isEventLive}
        canPreview={canPreview}
      />

      <div className={styles.content}>
        <EventManageSidebar
          currentSection={section}
          sectionStatus={sectionStatus}
          navigateToSection={navigateToSection}
          eventId={eventId}
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
            {renderCurrentSection()}
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

export default EventManagePage;