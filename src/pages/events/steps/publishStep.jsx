import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './publishStep.module.scss';
import { getEventData } from '../../../utils/eventUtil';
import { getUserData } from '../../../utils/authUtil';

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
  // State for the preview mode
  const [activeTab, setActiveTab] = useState('preview');
  const [localEventData, setLocalEventData] = useState(eventData);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Fetch event data from localStorage on component mount
  useEffect(() => {
    const storedEventData = getEventData();
    if (storedEventData) {
      // Merge stored event data with props data, preferring stored data
      setLocalEventData({
        ...eventData,
        ...storedEventData
      });
    }
    
    // Fetch user data
    const userInfo = getUserData();
    if (userInfo) {
      setUserData(userInfo);
    }
  }, [eventData]);
  
  /**
   * Toggle the user info modal
   */
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  
  // Format date for display
  const formatEventDate = () => {
    // Check if dateTime object exists in the local event data
    if (!localEventData.dateTime || !localEventData.dateTime.startDate) {
      return 'Wed, 5 Mar'; // Default fallback
    }
    
    try {
      // Format start date
      const startDate = new Date(localEventData.dateTime.startDate);
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      
      // Check if end date is the same as start date
      if (localEventData.dateTime.endDate === localEventData.dateTime.startDate) {
        return startDate.toLocaleDateString('en-US', options);
      }
      
      // Format both dates if different
      if (localEventData.dateTime.endDate) {
        const endDate = new Date(localEventData.dateTime.endDate);
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
      }
      
      return startDate.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting event date:', error);
      return 'Wed, 5 Mar'; // Default fallback
    }
  };
  
  // Format time for display
  const formatEventTime = () => {
    // Check if dateTime object exists in the local event data
    if (!localEventData.dateTime || !localEventData.dateTime.startTime || !localEventData.dateTime.endTime) {
      return '7pm-11pm'; // Default fallback
    }
    
    try {
      return `${formatTime(localEventData.dateTime.startTime)}-${formatTime(localEventData.dateTime.endTime)}`;
    } catch (error) {
      console.error('Error formatting event time:', error);
      return '7pm-11pm'; // Default fallback
    }
  };
  
  // Helper to format time from 24h to 12h format
  const formatTime = (time24h) => {
    if (!time24h) return '';
    try {
      // Handle cases where time might include seconds
      const timeComponents = time24h.split(':');
      const hours = parseInt(timeComponents[0], 10);
      const ampm = hours >= 12 ? 'pm' : 'am';
      const hour12 = hours % 12 || 12;
      return `${hour12}${ampm}`;
    } catch (error) {
      console.error('Error converting time format:', error);
      return '';
    }
  };

  // Get location information
  const getLocation = () => {
    // Check if location object exists and if TBA flag is set
    if (localEventData.location?.isToBeAnnounced) {
      return 'To be announced';
    }
    
    try {
      const location = localEventData.location || {};
      
      // Check for venue first - this is the most specific
      if (location.venueName) {
        return location.venueName;
      }
      
      // Fall back to city and country
      if (location.city && location.country) {
        return `${location.city}, ${location.country}`;
      }
      
      // Check individual fields
      if (location.city) {
        return location.city;
      }
      
      if (location.venue) {
        return location.venue;
      }
      
      return 'Auckland, New Zealand'; // Default
    } catch (error) {
      console.error('Error getting location:', error);
      return 'Auckland, New Zealand'; // Default fallback
    }
  };

  // Get venue address
  const getVenueAddress = () => {
    try {
      const location = localEventData.location || {};
      
      // If we have a full formatted address, use it
      if (location.address) {
        return location.address;
      }
      
      // Otherwise build address from parts
      const addressParts = [];
      
      if (location.streetNo || location.streetNumber) {
        addressParts.push(location.streetNo || location.streetNumber);
      }
      
      if (location.street) {
        addressParts.push(location.street);
      } else if (location.streetNo || location.streetNumber) {
        const streetPart = location.streetNumber ? 
          `${location.streetNumber} ${location.street}` : 
          location.street;
        addressParts.push(streetPart);
      }
      
      if (location.city) addressParts.push(location.city);
      if (location.state) addressParts.push(location.state);
      if (location.postalCode) addressParts.push(location.postalCode);
      if (location.country) addressParts.push(location.country);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
      
      // If we have a venue name but no address parts
      if (location.venue || location.venueName) {
        return location.venue || location.venueName;
      }
      
      return 'Auckland, New Zealand'; // Default fallback
    } catch (error) {
      console.error('Error getting venue address:', error);
      return 'Auckland, New Zealand'; // Default fallback
    }
  };

  // Get ticket information
  const getLowestTicketPrice = () => {
    if (!localEventData.tickets || localEventData.tickets.length === 0) {
      return '$20.00';
    }
    
    try {
      const prices = localEventData.tickets
        .map(ticket => parseFloat(ticket.price))
        .filter(price => !isNaN(price));
      
      if (prices.length === 0) return '$20.00';
      
      return `$${Math.min(...prices).toFixed(2)}`;
    } catch (error) {
      console.error('Error calculating lowest ticket price:', error);
      return '$20.00'; // Default fallback
    }
  };

  // Check if all steps are completed
  const areAllStepsCompleted = () => {
    try {
      // Check each required step
      const hasName = !!localEventData.name || !!localEventData.basicInfo?.title;
      const hasLocation = (localEventData.location?.isToBeAnnounced) || 
                         (localEventData.location?.venue && localEventData.location?.city) ||
                         (localEventData.location?.venueName && localEventData.location?.city);
      const hasDateTime = (localEventData.dateTime?.startDate && localEventData.dateTime?.startTime);
      const hasDescription = !!localEventData.description;
      const hasTickets = localEventData.tickets && localEventData.tickets.length > 0;
      
      return hasName && hasLocation && hasDateTime && hasDescription && hasTickets;
    } catch (error) {
      console.error('Error checking completion status:', error);
      return false;
    }
  };
  
  // Extract images from description HTML
  const getImagesFromDescription = () => {
    if (!localEventData.description) return [];
    
    try {
      // Create a temporary element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = localEventData.description;
      
      // Find all image tags
      const imgTags = tempDiv.getElementsByTagName('img');
      const images = Array.from(imgTags).map(img => img.src);
      
      return images.length > 0 ? images : [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg'
      ];
    } catch (error) {
      console.error('Error extracting images from description:', error);
      return [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg'
      ];
    }
  };

  // Get the placeholder text for description if empty
  const getDescriptionContent = () => {
    if (localEventData.description) {
      return localEventData.description;
    }
    
    return `
      <p>Get ready for Enchanted Festival 2023, where music, nature, and culture collide. 
      Featuring a star-studded lineup of global artists and local talent performing across 
      multiple stages in breathtaking New Zealand, this two-day festival brings together an 
      electrifying array of performers, activates, and installations.</p>
      
      <p>Beyond the music, Enchantment offers a vibrant festival village filled with 
      experiences and installations 🎭, gourmet food trucks 🍔, craft beer & cocktail bars 
      🍹, relaxation zones, and immersive art installations. The festival grounds are dotted 
      with sacred spots & breakaway meadows, enhancing meaning ✨</p>
      
      <p>As the sun rises, morning yoga opens the festival, creating a mindful start before 
      all the festivities begin. The festival transforms into a dream wonderland as the sun 
      sets, creating a magical dreamscape with twinkling lights leading you from one stage 
      to the next.</p>
      
      <p>Whether you're here for the music, the adventure, or the magical atmosphere, 
      Enchanted Festival is an experience you'll never forget! 💫</p>
    `;
  };

  // Debug function to log event data structure
  const logEventDataStructure = () => {
    console.log('Event Data Structure:', JSON.stringify(localEventData, null, 2));
  };

  // Uncomment this for debugging
  // useEffect(() => {
  //   logEventDataStructure();
  // }, [localEventData]);

  return (
    <div className={styles.pageContainer}>
      {publishSuccess && (
        <div className={styles.successAlert}>
          Your event has been published successfully! Redirecting to event page...
        </div>
      )}
      
      <div className={styles.previewHeader}>
        <div className={styles.previewTabs}>
          {/* <button 
            className={`${styles.previewTab} ${activeTab === 'preview' ? styles.active : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button> */}
          {/* <button 
            className={`${styles.previewTab} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button> */}
        </div>
        <button className={styles.openNewTabButton}>
          Open in new tab
        </button>
      </div>
      
      {/* {!areAllStepsCompleted() && (
        <div className={styles.incompleteStepsWarning}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#ef4444"/>
          </svg>
          <div>
            <h3>Please complete all steps before publishing</h3>
            <p>This ensures your event page will look its best for potential attendees.</p>
          </div>
        </div>
      )} */}
      
      <div className={styles.eventPreview}>
        {/* Event Banner */}
        <div className={styles.eventBanner}>
          <h1 className={styles.eventBannerTitle}>
            {localEventData.name || localEventData.basicInfo?.title || 'NORR Festival 2022'}
          </h1>
          <div className={styles.saveButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3H7C5.9 3 5.01 3.9 5.01 5L5 21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" fill="white"/>
            </svg>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className={styles.eventContent}>
          <div className={styles.eventImageColumn}>
            <div className={styles.eventImage}>
              {/* Event thumbnail/image */}
              <img 
                src={localEventData.art?.thumbnailUrl || "/images/event-placeholder.jpg"} 
                alt={localEventData.name || localEventData.basicInfo?.title || "NORR Festival 2022"} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23CCCCCC"/><text x="50%" y="50%" font-family="Arial" font-size="36" fill="%23666666" text-anchor="middle" dominant-baseline="middle">Image</text></svg>';
                }}
              />
            </div>
            <div className={styles.ticketCta}>
              <div className={styles.ticketCtaTop}>
                <h3>Buy Tickets</h3>
                <p>Tickets starting from {getLowestTicketPrice()}</p>
              </div>
              <button className={styles.ticketCtaButton}>
                Get Tickets
              </button>
            </div>
          </div>
          
          <div className={styles.eventDetailsColumn}>
            <div className={styles.eventHeader}>
              <h1>{localEventData.name || localEventData.basicInfo?.title || 'NORR FESTIVAL 2022'}</h1>
              
              <div className={styles.eventMeta}>
                <div className={styles.eventMetaItem}>
                  <div className={styles.eventMetaIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 20.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z" fill="#7C3AED"/>
                    </svg>
                  </div>
                  <div className={styles.eventMetaText}>
                    {formatEventDate()}, {formatEventTime()}
                  </div>
                </div>
                
                <div className={styles.eventMetaItem}>
                  <div className={styles.eventMetaIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#7C3AED"/>
                    </svg>
                  </div>
                  <div className={styles.eventMetaText}>
                    {getLocation()}
                  </div>
                </div>
              </div>
              
              <div className={styles.organizerInfo}>
                <div className={styles.organizerLogo}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="white"/>
                  </svg>
                </div>
                <div className={styles.organizerName}>
                  {userData?.name || localEventData.organizerName || 'City Music Festival Ltd.'}
                </div>
                <div className={styles.organizerMeta}>
                  {/* {localEventData.organizerMeta || '23 Events Conducted'} */}
                </div>
                <button className={styles.contactButton} onClick={toggleModal}>Contact Host</button>
              </div>
              
              {/* User Info Modal */}
              {showModal && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <div className={styles.modalHeader}>
                      <h3>Organizer Information</h3>
                      <button 
                        className={styles.closeButton}
                        onClick={toggleModal}
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.modalContent}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Name:</span>
                        <span className={styles.infoValue}>{userData?.name || 'Not available'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Organization:</span>
                        <span className={styles.infoValue}>{userData?.organizationName || 'Not available'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}>{userData?.email || 'Not available'}</span>
                      </div>
                    </div>
                    <div className={styles.modalFooter}>
                      <button 
                        className={styles.modalButton}
                        onClick={toggleModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.eventSections}>
              <div className={styles.eventSection}>
                <h2 className={styles.sectionTitle}>About</h2>
                <div 
                  className={styles.sectionContent}
                  dangerouslySetInnerHTML={{ __html: getDescriptionContent() }}
                ></div>
              </div>
              
              <div className={styles.eventSection}>
                <h2 className={styles.sectionTitle}>Venue</h2>
                <div className={styles.venueInfo}>
                  <h3 className={styles.venueName}>
                    {localEventData.location?.venue || localEventData.location?.venueName || "Event Venue"}
                  </h3>
                  <p className={styles.venueAddress}>{getVenueAddress()}</p>
                  <div className={styles.venueMap}>
                    <img src="/images/google-map-placeholder.jpg" alt="Venue location" />
                    <div className={styles.mapOverlay}>
                      <div className={styles.mapLogo}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.3283 14.4353 9.65339 14.3097 9.95671C14.1841 10.26 14 10.5356 13.7678 10.7678C13.5356 11 13.26 11.1841 12.9567 11.3097C12.6534 11.4353 12.3283 11.5 12 11.5ZM12 2C10.1435 2 8.36301 2.7375 7.05025 4.05025C5.7375 5.36301 5 7.14348 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 7.14348 18.2625 5.36301 16.9497 4.05025C15.637 2.7375 13.8565 2 12 2Z" fill="#4285F4"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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