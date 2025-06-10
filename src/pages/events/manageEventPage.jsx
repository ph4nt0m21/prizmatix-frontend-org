/*
File: manageEventPage.jsx
*/
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventHeaderNav from './components/eventHeaderNav';
import EventManageSidebar from './components/eventManageSidebar';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './manageEventPage.module.scss';

// Import manage section components
import OverviewSection from './sections/overviewSection';
import OrdersAndAttendeesSection from './sections/ordersAndAttendeesSection';
import PayoutSection from './sections/payoutSection';
import PromotionsSection from './sections/promotionsSection';
// EventPageSection is removed as it's not a generic section, but specific edit content for eventEditPage
// import EventPageSection from './sections/eventPageSection';


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

  // Event data state with dummy values
  const [eventData, setEventData] = useState({
    id: eventId || '12345',
    name: 'NORR Festival 2022',
    status: 'Live',
    location: {
      city: 'Queenstown',
      country: 'New Zealand'
    },
    dateTime: {
      startDate: '2025-05-12',
      startTime: '10:00',
      endDate: '2025-05-12',
      endTime: '22:00'
    },
    earnings: {
      total: 6583.25,
      percentageChange: 15.8
    },
    tickets: {
      issued: 250,
      total: 1050,
      percentageChange: 15.8
    },
    orders: {
      count: 189,
      percentageChange: 15.8
    },
    views: {
      count: 1,
      percentageChange: 15.8
    },
    ticketTypes: [
      { name: 'Early Bird', sales: 3200.00 },
      { name: 'VIP', sales: 3300.00 }
    ],
    salesData: {
      dailyRevenue: 1220.00,
      timeframe: '10 days'
    }
  });

  // Current section state (default to 'overview' if not specified)
  const [currentSection, setCurrentSection] = useState('overview');

  // Track completion status for each manage section (dummy data)
  const [sectionStatus, setSectionStatus] = useState({
    overview: { completed: true, valid: true, visited: true },
    ordersAndAttendees: { completed: true, valid: true, visited: false },
    payout: { completed: true, valid: true, visited: false },
    promotions: { completed: true, valid: true, visited: false },
    // 'eventPage' and 'tickets' are now separate pages, no longer tracked here
  });

  // Simulate data fetching on mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // In a real app, you would fetch event data here
        // For now, we're using the dummy data from state

        // Set loading to false after "fetching" data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setError('Failed to load event data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Parse section parameter and update current section for manage sections
  useEffect(() => {
    if (section && sectionStatus[section]) { // Only update if the section is one of the "manage" sections
      setCurrentSection(section);
      setSectionStatus(prevStatus => ({
        ...prevStatus,
        [section]: {
          ...prevStatus[section],
          visited: true
        }
      }));
    } else {
      setCurrentSection('overview'); // Default to overview if no valid section or section is external
    }
  }, [section, sectionStatus]);

  /**
   * Navigate to a specific section within manageEventPage
   * @param {string} sectionName - Section to navigate to
   */
  const navigateToManageSection = (sectionName) => {
    navigate(`/events/manage/${eventId}/${sectionName}`);
    setCurrentSection(sectionName);
  };

  /**
   * Render placeholders for sections not yet implemented
   * @param {string} sectionName - Name of the section
   * @returns {JSX.Element} Placeholder component
   */
  const renderPlaceholder = (sectionName) => {
    return (
      <div className={styles.placeholderContainer}>
        <h2 className={styles.placeholderTitle}>{sectionName} Section</h2>
        <p className={styles.placeholderMessage}>This section is coming soon.</p>
        <button
          className={styles.placeholderButton}
          onClick={() => navigateToManageSection('overview')}
        >
          Back to Overview
        </button>
      </div>
    );
  };

  /**
   * Render the current section
   * @returns {JSX.Element} Current section component
   */
  const renderCurrentSection = () => {
    // Show loading spinner while loading
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading event data...</p>
        </div>
      );
    }

    // Handle different sections
    switch (currentSection) {
      case 'overview':
        return <OverviewSection eventData={eventData} />;
      case 'ordersAndAttendees':
        return <OrdersAndAttendeesSection eventData={eventData} />;
      case 'payout':
        return <PayoutSection eventData={eventData} />;
      case 'promotions':
        return <PromotionsSection eventData={eventData} />;
      // 'eventPage' and 'tickets' are now full pages, not rendered here.
      default:
        return <OverviewSection eventData={eventData} />;
    }
  };

  // Check if the current event is live
  const isEventLive = eventData.status === 'Live';

  // Determine if preview is available
  const canPreview = true; // In management view, preview should always be available

  return (
    <>

      {/* Event-specific sub-header with breadcrumbs and actions */}
      <EventHeaderNav
        currentStep={currentSection === 'overview' ? 'Overview' : currentSection}
        eventName={eventData.name}
        isDraft={!isEventLive}
        canPreview={canPreview}
      />

      <div className={styles.content}>
        <EventManageSidebar
          currentSection={currentSection}
          sectionStatus={sectionStatus}
          navigateToSection={navigateToManageSection} // For 'manage' sections
          navigateToEventEditPage={() => navigate(`/events/edit-page/${eventId}`)} // For 'Event Page'
          navigateToTicketEditPage={() => navigate(`/events/tickets/${eventId}`)} // For 'Tickets'
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