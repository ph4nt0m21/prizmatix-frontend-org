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
  
  // Current section state (default to 'overview' if not specified)
  const [currentSection, setCurrentSection] = useState('overview');
  
  // Track completion status for each step (dummy data)
  const [sectionStatus, setSectionStatus] = useState({
    overview: { completed: true, valid: true, visited: true },
    ordersAndAttendees: { completed: true, valid: true, visited: false },
    payout: { completed: true, valid: true, visited: false },
    promotions: { completed: true, valid: true, visited: false },
    eventPage: { completed: true, valid: true, visited: false },
    tickets: { completed: true, valid: true, visited: false }
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
  
  // Parse section parameter and update current section
  useEffect(() => {
    if (section) {
      setCurrentSection(section);
      
      // Mark the current section as visited
      setSectionStatus(prevStatus => ({
        ...prevStatus,
        [section]: {
          ...prevStatus[section],
          visited: true
        }
      }));
    } else {
      setCurrentSection('overview');
    }
  }, [section]);
  
  /**
   * Navigate to a specific section
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
      case 'payouts':
        return <PayoutSection eventData={eventData} />;
      case 'promotions':
        return <PromotionsSection eventData={eventData} />;
      default:
        return <OverviewSection eventData={eventData} />; // Default to Overview
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