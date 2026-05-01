import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import styles from './scannerPage.module.scss';
import { FiXCircle, FiCheckCircle, FiMaximize, FiUsers } from 'react-icons/fi';
import AttendeesTable from './components/attendeesTable';
import {
  GetAllOrganizationEventsAPI,
  GetEventAttendeesAPI,
  CheckInAttendeeAPI,
  CheckoutAttendeeAPI,
  VerifyQrCodeAPI,
} from '../../services/allApis';
import { getUserData } from '../../utils/authUtil';

const ScannerPage = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEventLoading, setIsEventLoading] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    const fetchOrganizationEvents = async () => {
      try {
        setIsEventLoading(true);
        const userData = getUserData();
        const orgId = userData?.organizationId;

        if (!orgId) {
          setError('Organization not found. Please login again.');
          setEvents([]);
          return;
        }

        const response = await GetAllOrganizationEventsAPI(orgId);
        const list = Array.isArray(response.data) ? response.data : response.data?.content || [];
        setEvents(list);
        setSelectedEventId(list[0]?.id ? String(list[0].id) : '');
      } catch (err) {
        console.error('Failed to fetch organization events:', err);
        setError('Could not load organization events.');
      } finally {
        setIsEventLoading(false);
      }
    };

    fetchOrganizationEvents();
  }, []);

  useEffect(() => {
    const fetchAttendeesForEvent = async () => {
      if (!selectedEventId) {
        setAttendees([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await GetEventAttendeesAPI(selectedEventId);
        const formatted = (response.data || []).map((a, index) => ({
          id: a.ticketId || `att-${index}`,
          name: a.attendeeName || 'Unknown',
          ticketType: a.ticketType || 'N/A',
          isCheckedIn: !!a.checkedIn,
          checkedInAt: a.checkedInAt || null,
        }));
        setAttendees(formatted);
      } catch (err) {
        console.error('Failed to fetch event attendees:', err);
        setError('Could not load attendees for the selected event.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendeesForEvent();
  }, [selectedEventId]);

  const handleScan = async (data) => {
    if (data) {
      setHasScanned(true);
      const qrContent = data.text.trim();
      setScannedData({ text: qrContent, timestamp: new Date().toLocaleTimeString() });
      setError(null);
      setSuccessMessage(null);
      setIsScannerOpen(false);

      try {
        const response = await VerifyQrCodeAPI({ qrContent });
        const { orderId, eventName, attendees: attendeesFromOrder } = response.data;

        const scannedAttendees = (attendeesFromOrder || []).map((a, index) => ({
          id: a.ticketId || `scan-${index}`,
          name: a.attendeeName || 'Unknown',
          ticketType: a.ticketType || 'N/A',
          isCheckedIn: !!a.checkedIn,
          checkedInAt: a.checkedInAt || null,
        }));
        const scannedById = new Map(scannedAttendees.map((a) => [a.id, a]));
        setAttendees((current) =>
          current.map((attendee) => scannedById.get(attendee.id) || attendee)
        );
        setSuccessMessage(
          `Order #${orderId} verified for ${eventName}. Found ${scannedAttendees.length} attendees.`
        );
      } catch (err) {
        console.error('QR verification failed:', err);
        setError('Invalid QR Code or ticket does not belong to this event.');
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Could not access the camera. Please check permissions.');
    setIsScannerOpen(false);
  };

  const openScanner = () => {
    setScannedData(null);
    setError(null);
    setSuccessMessage(null);
    setIsScannerOpen(true);
  };

  const handleToggleCheckIn = async (ticketId, isCurrentlyCheckedIn) => {
    try {
      if (isCurrentlyCheckedIn) {
        await CheckoutAttendeeAPI(ticketId);
        setAttendees((current) =>
          current.map((att) =>
            att.id === ticketId ? { ...att, isCheckedIn: false, checkedInAt: null } : att
          )
        );
      } else {
        await CheckInAttendeeAPI(ticketId);
        setAttendees((current) =>
          current.map((att) =>
            att.id === ticketId
              ? { ...att, isCheckedIn: true, checkedInAt: new Date().toISOString() }
              : att
          )
        );
      }
    } catch (err) {
      console.error('Check-in/out failed:', err);
      setError('Failed to update attendee status. Please try again.');
    }
  };

  // ✅ NEW FUNCTION — Check in all currently filtered attendees
  const handleCheckInAll = async () => {
    try {
      const unchecked = attendees.filter((a) => !a.isCheckedIn);
      if (unchecked.length === 0) {
        setSuccessMessage('All attendees are already checked in.');
        return;
      }

      // Call API for each attendee (could be parallelized)
      await Promise.all(unchecked.map((att) => CheckInAttendeeAPI(att.id)));

      // Update UI optimistically
      setAttendees((current) =>
        current.map((a) => ({ ...a, isCheckedIn: true, checkedInAt: new Date().toISOString() }))
      );

      setSuccessMessage(`✅ Checked in ${unchecked.length} attendee(s) successfully.`);
    } catch (err) {
      console.error('Bulk check-in failed:', err);
      setError('Failed to check in all attendees. Please try again.');
    }
  };

  const cameraConstraints = { video: { facingMode: 'environment' } };

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.contentWrapper}>
        <h1>Ticket Scanner</h1>
        <div className={styles.eventSelectorRow}>
          <label htmlFor="event-selector" className={styles.eventSelectorLabel}>
            Event
          </label>
          <select
            id="event-selector"
            className={styles.eventSelector}
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setHasScanned(false);
              setSuccessMessage(null);
              setError(null);
            }}
            disabled={isEventLoading || events.length === 0}
          >
            {events.length === 0 ? (
              <option value="">No events available</option>
            ) : (
              events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))
            )}
          </select>
        </div>
        {isScannerOpen ? (
          <div className={styles.scannerActive}>
            <div className={styles.scannerPreview}>
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
                constraints={cameraConstraints}
              />
              <div className={styles.viewfinder}></div>
            </div>
            <button onClick={() => setIsScannerOpen(false)} className={styles.closeButton}>
              <FiXCircle /> Close Scanner
            </button>
          </div>
        ) : (
          <div className={styles.scannerIdle}>
            {error && (
              <div className={`${styles.resultBox} ${styles.error}`}>
                <FiXCircle size={24} /> <p>{error}</p>
              </div>
            )}
            {successMessage && (
              <div className={`${styles.resultBox} ${styles.success}`}>
                <FiCheckCircle size={24} />
                <p>{successMessage}</p>
              </div>
            )}
            <button
              onClick={openScanner}
              className={styles.openButton}
              disabled={!selectedEventId || isEventLoading}
            >
              <FiMaximize /> Open Scanner
            </button>
          </div>
        )}
      </div>

      <div className={styles.attendeesSection}>
        <div className={styles.tableHeader}>
          <FiUsers />
          <h2>Attendee List</h2>
          {/* ✅ NEW BUTTON */}
          {hasScanned && attendees.length > 0 && (
  <button className={styles.checkInAllButton} onClick={handleCheckInAll}>
    Check In All
  </button>
)}
        </div>

        {isLoading ? (
          <p className={styles.loadingText}>Loading attendees...</p>
        ) : !selectedEventId ? (
          <p className={styles.loadingText}>Select an event to see attendees.</p>
        ) : (
          <AttendeesTable attendees={attendees} onToggleCheckIn={handleToggleCheckIn} />
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
