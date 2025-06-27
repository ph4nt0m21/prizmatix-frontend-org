import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './publishStep.module.scss';
import { getEventData } from '../../../utils/eventUtil';
import { getUserData } from '../../../utils/authUtil';

/**
 * PublishStep component - Final step of event creation.
 * Shows a preview of the event page with a dynamic map.
 */
const PublishStep = ({
  eventData = {},
}) => {

  console.log('3. [PublishStep] Received props with location:', eventData.location);
  // --- ADDED: useRef for the map container and to ensure map only initializes once ---
  const mapRef = useRef(null);
  const mapInitialized = useRef(false);

  const [localEventData, setLocalEventData] = useState(eventData);
  const [userData, setUserData] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // --- MODIFIED: Load data ensuring props overwrite localStorage ---
  useEffect(() => {
    const storedEventData = getEventData();
    // Prioritize fresh data from props over stale data from storage
    setLocalEventData({
      ...storedEventData,
      ...eventData,
    });
    const userInfo = getUserData();
    if (userInfo) {
      setUserData(userInfo);
    }
  }, [eventData]);

  // --- ADDED: useEffect hook to initialize the dynamic Google Map ---
  useEffect(() => {
    const initializeMap = () => {
      const location = localEventData.location;
      console.log('4. [PublishStep] Attempting to initialize map with location:', location);
      if (mapInitialized.current || !mapRef.current || !location?.latitude || !location?.longitude) {
        return; // Exit if map is already created or if there's no container/coordinates
      }

      const position = {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
      });

      new window.google.maps.Marker({
        position,
        map: map,
      });

      mapInitialized.current = true; // Mark map as initialized
    };

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) {
        script.addEventListener('load', initializeMap, { once: true });
      }
    }
  }, [localEventData.location]); // Re-run this effect if the location data changes

// Helper function to create the new combined date-time string
  const formatEventDateTimeRange = () => {
    const { startDate, startTime, endDate, endTime } = localEventData.dateTime || {};
    if (!startDate || !startTime) return 'Date and time not set';

    try {
      // Helper to format the date part (e.g., "Wed, 5 Mar")
      const formatDate = (dateString, includeWeekday = true) => {
        const options = {
          weekday: includeWeekday ? 'short' : undefined,
          day: 'numeric',
          month: 'short',
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(`${dateString}T00:00:00`));
      };

      // Helper to format the time part (e.g., "7:30pm")
      const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return new Intl.DateTimeFormat('en-US', options).format(date).toLowerCase().replace(' ', '');
      };

      const formattedStartDate = formatDate(startDate);
      const formattedStartTime = formatTime(startTime);

      // Default end part is just the end time, for same-day events
      let formattedEndPart = endTime ? formatTime(endTime) : '';

      // If an end date exists and is different from the start date
      if (endDate && endDate !== startDate) {
        // Format the end date without the weekday and prepend it to the end time
        const formattedEndDate = formatDate(endDate, false); // e.g., "6 Mar"
        formattedEndPart = `${formattedEndDate}, ${formatTime(endTime)}`;
      }
      
      return `${formattedStartDate}, ${formattedStartTime} - ${formattedEndPart}`;

    } catch (e) {
      console.error("Error formatting event date-time range:", e);
      return "Invalid date or time";
    }
  };

  // Helper function to format time range
  const formatEventTime = () => {
    if (!localEventData.dateTime?.startTime || !localEventData.dateTime?.endTime) return 'Time not set';
    const formatTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(hours, minutes);
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(date).toLowerCase().replace(' ', '');
    }
    try {
      return `${formatTime(localEventData.dateTime.startTime)}-${formatTime(localEventData.dateTime.endTime)}`;
    } catch (e) {
      return 'Invalid Time';
    }
  };

  // Helper function to get location string
  const getLocation = () => {
    if (localEventData.location?.isToBeAnnounced) return 'To be announced';
    const { city, country } = localEventData.location || {};
    if (city && country) return `${city}, ${country}`;
    return city || country || 'Location not set';
  };

  // Helper function to get venue address
  const getVenueAddress = () => {
    const { street, city, state, country } = localEventData.location || {};
    if (street && city && state && country) return `${street}, ${city}, ${state}, ${country}`;
    return getLocation();
  };

  // Helper function to get the lowest ticket price
  const getLowestTicketPrice = () => {
    if (!localEventData.tickets || localEventData.tickets.length === 0) return 'N/A';
    try {
      const prices = localEventData.tickets.map(t => parseFloat(t.price)).filter(p => !isNaN(p));
      if (prices.length === 0) return 'Free';
      const minPrice = Math.min(...prices);
      return minPrice === 0 ? 'Free' : `$${minPrice.toFixed(2)}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Helper function to safely render description HTML
  const getDescriptionContent = () => {
    return localEventData.description || '<p>No description provided.</p>';
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.previewHeader}>
        <button className={styles.openNewTabButton}>Open in new tab</button>
      </div>

      <div className={styles.eventPreview}>
        <div
          className={styles.eventBanner}
          style={{
            backgroundImage: localEventData.art?.bannerUrl
              ? `url(${localEventData.art.bannerUrl})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        >
        </div>

        <div className={styles.eventContent}>
          <div className={styles.eventImageColumn}>
            <div className={styles.eventImage}>
              <img
                src={localEventData.art?.thumbnailUrl || "/images/event-placeholder.jpg"}
                alt={localEventData.name || "Event Thumbnail"}
                onError={(e) => { e.target.onerror = null; e.target.src = "/images/event-placeholder.jpg"; }}
              />
            </div>
            <div className={styles.ticketCta}>
              <div className={styles.ticketCtaTop}>
                <h3>Buy Tickets</h3>
                <p>Tickets starting from {getLowestTicketPrice()}</p>
              </div>
              <button className={styles.ticketCtaButton}>Get Tickets</button>
            </div>
          </div>

          <div className={styles.eventDetailsColumn}>
            <div className={styles.eventHeader}>
              <h>{localEventData.name}</h>
              <div className={styles.eventMeta}>
                <div className={styles.eventMetaItem}>
                  <div className={styles.eventMetaIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7C3AED" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 20.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" /></svg>
                  </div>
                  <div className={styles.eventMetaText}>{formatEventDateTimeRange()}</div>
                </div>
                {/* <div className={styles.eventMetaItem}>
                  <div className={styles.eventMetaIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7C3AED" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" /></svg>
                  </div>
                  <div className={styles.eventMetaText}>{getLocation()}</div>
                </div> */}
              </div>
              <div className={styles.organizerInfo}>
                <div className={styles.organizerLogo}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" /></svg>
                </div>
                <div className={styles.organizerName}>{userData?.organizationName || 'Event Host'}</div>
                <button className={styles.contactButton} onClick={() => setShowContactModal(true)}>Contact Host</button>
              </div>
            </div>

            <div className={styles.eventSections}>
              <div className={styles.eventSection}>
                <h2 className={styles.sectionTitle}>About</h2>
                <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: getDescriptionContent() }} />
              </div>
              <div className={styles.eventSection}>
                <h2 className={styles.sectionTitle}>Venue</h2>
                <div className={styles.venueInfo}>
                  <h3 className={styles.venueName}>{localEventData.location?.venue}</h3>
                  <p className={styles.venueAddress}>{getVenueAddress()}</p>

                  {/* --- MODIFIED: This section now renders the dynamic map --- */}
                  {!localEventData.location?.isToBeAnnounced && (
                  <div className={styles.venueMap}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
                      {/* If lat/lng are missing, show a placeholder message */}
                      {(!localEventData.location?.latitude || !localEventData.location?.longitude) && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0e0e0', color: '#666' }}>
                          Map data not available
                        </div>
                      )}
                    </div>
                    {/* <div className={styles.mapOverlay}>
                      <div className={styles.mapLogo}><svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4" xmlns="http://www.w3.org/2000/svg"><path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13C19 5.13 15.87 2 12 2Z" /></svg></div>
                    </div> */}
                  </div>)}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className={styles.modalOverlay} onClick={() => setShowContactModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Organizer Information</h3>
              <button className={styles.closeButton} onClick={() => setShowContactModal(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.infoRow}><span className={styles.infoLabel}>Name:</span><span className={styles.infoValue}>{userData?.name || 'N/A'}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>Organization:</span><span className={styles.infoValue}>{userData?.organizationName || 'N/A'}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>Email:</span><span className={styles.infoValue}>{userData?.email || 'N/A'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PublishStep.propTypes = {
  eventData: PropTypes.object,
};

export default PublishStep;