// src/pages/events/steps/publishStep.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './steps.module.scss';

/**
 * PublishStep component - Final step of event creation
 * Shows event preview and publish options
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @param {boolean} props.isPublishing Whether the event is being published
 * @returns {JSX.Element} PublishStep component
 */
const PublishStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false },
  isPublishing = false
}) => {
  // API-related state
  const [publishSuccess, setPublishSuccess] = useState(false);
  
  // Format date for display
  const formatEventDate = () => {
    if (!eventData.dateTime?.startDate) return '';
    
    const date = new Date(eventData.dateTime.startDate);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format time for display
  const formatEventTime = () => {
    if (!eventData.dateTime?.startTime || !eventData.dateTime?.endTime) return '';
    
    return `${formatTime(eventData.dateTime.startTime)}-${formatTime(eventData.dateTime.endTime)}`;
  };
  
  // Helper to format time from 24h to 12h format
  const formatTime = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}${ampm}`;
  };
  
  // Handle preview button click
  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/events/preview/${eventData.id || 'draft'}`, '_blank');
  };
  
  // Get banner image URL or use placeholder
  const getBannerImageUrl = () => {
    if (eventData.art?.bannerUrl) {
      return eventData.art.bannerUrl;
    }
    
    // Use a gradient placeholder if no banner
    return 'linear-gradient(60deg, #84cc16 0%, #a855f7 30%, #ef4444 60%, #f97316 100%)';
  };
  
  // Get thumbnail image URL or use placeholder
  const getThumbnailImageUrl = () => {
    if (eventData.art?.thumbnailUrl) {
      return eventData.art.thumbnailUrl;
    }
    
    // Use a placeholder if no thumbnail
    return '/images/event-placeholder.jpg';
  };
  
  // Get location string
  const getLocationString = () => {
    if (eventData.location?.isToBeAnnounced) {
      return 'To be announced';
    }
    
    if (eventData.location?.city && eventData.location?.country) {
      return `${eventData.location.city}, ${eventData.location.country}`;
    }
    
    return 'Location not specified';
  };

  /**
   * Check for incomplete steps and return a list of them
   * @returns {Array} List of incomplete steps
   */
  const getIncompleteSteps = () => {
    const incompleteSteps = [];
    
    if (!eventData.name) {
      incompleteSteps.push('Basic Info');
    }
    
    if (!eventData.location.isToBeAnnounced && 
        (!eventData.location.venue || !eventData.location.city || !eventData.location.country)) {
      incompleteSteps.push('Location');
    }
    
    if (!eventData.dateTime.startDate || !eventData.dateTime.startTime || 
        !eventData.dateTime.endDate || !eventData.dateTime.endTime) {
      incompleteSteps.push('Date & Time');
    }
    
    if (!eventData.description) {
      incompleteSteps.push('Description');
    }
    
    if (!eventData.tickets || eventData.tickets.length === 0) {
      incompleteSteps.push('Tickets');
    }
    
    return incompleteSteps;
  };
  
  // Check if event is ready to publish
  const incompleteSteps = getIncompleteSteps();
  const isReadyToPublish = incompleteSteps.length === 0;
  
  return (
    <div className={styles.stepContainer}>
      {publishSuccess && (
        <div className={styles.successAlert}>
          Your event has been published successfully! Redirecting to event page...
        </div>
      )}
      
      <div className={styles.publishHeader}>
        <div className={styles.publishActions}>
          <h2 className={styles.publishTitle}>Preview</h2>
          <div className={styles.publishButtons}>
            <button 
              type="button"
              onClick={handlePreview}
              className={styles.previewButton}
              disabled={isPublishing}
            >
              Open in new tab
            </button>
          </div>
        </div>
      </div>
      
      {!isReadyToPublish && (
        <div className={styles.incompleteStepsWarning}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#ef4444"/>
          </svg>
          <div>
            <h3>Complete these steps before publishing:</h3>
            <ul>
              {incompleteSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className={styles.publishPreviewContainer}>
        {/* Banner Image */}
        <div 
          className={styles.eventBanner}
          style={{ 
            background: getBannerImageUrl(),
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <h1 className={styles.eventBannerTitle}>
            {eventData.name || 'NORR Festival 2022'}
          </h1>
        </div>
        
        {/* Event Details Section */}
        <div className={styles.eventDetailsContainer}>
          {/* Left side - Thumbnail */}
          <div className={styles.eventThumbnail}>
            <img 
              src={getThumbnailImageUrl()} 
              alt={eventData.name || 'Event thumbnail'} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23CCCCCC"/><text x="50%" y="50%" font-family="Arial" font-size="36" fill="%23666666" text-anchor="middle" dominant-baseline="middle">Image</text></svg>';
              }}
            />
          </div>
          
          {/* Right side - Event info */}
          <div className={styles.eventInfo}>
            <h2 className={styles.eventTitle}>
              {eventData.name || 'NORR FESTIVAL 2022'}
            </h2>
            
            <div className={styles.eventMetadata}>
              {/* Date and Time */}
              <div className={styles.eventMetaItem}>
                <div className={styles.eventMetaIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z" fill="#7C3AED"/>
                  </svg>
                </div>
                <div className={styles.eventMetaText}>
                  {formatEventDate() || 'Wed, 5 Mar'}, {formatEventTime() || '7pm-11pm'}
                </div>
              </div>
              
              {/* Location */}
              <div className={styles.eventMetaItem}>
                <div className={styles.eventMetaIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#7C3AED"/>
                  </svg>
                </div>
                <div className={styles.eventMetaText}>
                  {getLocationString()}
                </div>
              </div>
            </div>
            
            {/* Organizer */}
            <div className={styles.eventOrganizer}>
              <div className={styles.organizerLogo}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#7C3AED"/>
                </svg>
              </div>
              <div className={styles.organizerInfo}>
                <h3 className={styles.organizerName}>
                  {eventData.organizerName || 'City Music Festival Ltd.'}
                </h3>
                <p className={styles.organizerMeta}>
                  {eventData.organizerMeta || '23 Events Conducted'}
                </p>
              </div>
              <button type="button" className={styles.contactHostButton}>
                Contact Host
              </button>
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className={styles.eventAboutSection}>
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.eventDescription}>
            {eventData.description ? (
              <div dangerouslySetInnerHTML={{ __html: eventData.description }} />
            ) : (
              <p>No description provided for this event.</p>
            )}
          </div>
        </div>
        
        {/* Tickets Section */}
        <div className={styles.eventTicketsSection}>
          <h3 className={styles.sectionTitle}>Tickets</h3>
          {eventData.tickets && eventData.tickets.length > 0 ? (
            <div className={styles.ticketsList}>
              {eventData.tickets.map((ticket, index) => (
                <div key={index} className={styles.ticketItem}>
                  <div className={styles.ticketDetails}>
                    <h4 className={styles.ticketName}>{ticket.name}</h4>
                    <p className={styles.ticketPrice}>${parseFloat(ticket.price).toFixed(2)}</p>
                  </div>
                  <p className={styles.ticketQuantity}>
                    {ticket.quantity} available
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noTicketsMessage}>
              No tickets have been created yet. Add tickets to complete your event.
            </p>
          )}
        </div>
        
        {/* Buy Tickets CTA */}
        <div className={styles.eventTicketsCta}>
          <button type="button" className={styles.buyTicketsButton}>
            Buy Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

PublishStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object,
  isPublishing: PropTypes.bool
};

export default PublishStep;