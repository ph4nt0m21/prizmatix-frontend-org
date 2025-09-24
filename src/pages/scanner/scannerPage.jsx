import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // NEW: Import useParams
import QrScanner from 'react-qr-scanner';
import styles from './scannerPage.module.scss';
import { FiXCircle, FiCheckCircle, FiMaximize, FiUsers } from 'react-icons/fi';

// Import the table component
import AttendeesTable from './components/attendeesTable';
// Import your API functions
import { GetEventAttendeesAPI } from '../../services/allApis';

const ScannerPage = () => {
  const { eventId } = useParams(); // NEW: Get eventId directly from the URL

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data & UI State
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UPDATED: Fetch attendees using the eventId from the URL
  useEffect(() => {
    if (!eventId) {
        setError("No Event ID provided in the URL.");
        setIsLoading(false);
        return;
    };

    const fetchAttendees = async () => {
      try {
        setIsLoading(true);
        const response = await GetEventAttendeesAPI(eventId); // Use the correct API with eventId
        const formattedAttendees = response.data.map((attendee, index) => ({
          id: attendee.ticketId || `att-${index}`,
          name: attendee.attendeeName,
          ticketType: attendee.ticketType,
          isCheckedIn: false,
        }));
        setAttendees(formattedAttendees);
      } catch (err) {
        console.error("Failed to fetch attendees:", err);
        setError('Could not load the attendee list for this event.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]); // This effect re-runs if the eventId in the URL changes

  const handleScan = (data) => {
    if (data) {
      const scannedId = data.text;
      const targetAttendee = attendees.find(att => att.id === scannedId);
      setScannedData({ text: scannedId, timestamp: new Date().toLocaleTimeString() });

      if (targetAttendee) {
        if (!targetAttendee.isCheckedIn) {
          handleCheckIn(scannedId);
          setSuccessMessage(`${targetAttendee.name} has been successfully checked in.`);
        } else {
          setError(`${targetAttendee.name} has already been checked in.`);
        }
      } else {
        setError(`Ticket with ID "${scannedId}" not found in this event's attendee list.`);
      }
      setIsScannerOpen(false);
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
  
  const handleCheckIn = (attendeeId) => {
    setAttendees(current => current.map(att => att.id === attendeeId ? { ...att, isCheckedIn: true } : att));
  };

  const cameraConstraints = { video: { facingMode: 'environment' } };

  // Main UI
  return (
    <div className={styles.scannerContainer}>
      <div className={styles.contentWrapper}>
        <h1>Ticket Scanner</h1>
        {isScannerOpen ? (
          <div className={styles.scannerActive}>
            <div className={styles.scannerPreview}><QrScanner delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} constraints={cameraConstraints} /><div className={styles.viewfinder}></div></div>
            <button onClick={() => setIsScannerOpen(false)} className={styles.closeButton}><FiXCircle /> Close Scanner</button>
          </div>
        ) : (
          <div className={styles.scannerIdle}>
            {error && <div className={`${styles.resultBox} ${styles.error}`}><FiXCircle size={24} /> <p>{error}</p></div>}
            {successMessage && <div className={`${styles.resultBox} ${styles.success}`}><FiCheckCircle size={24} /><p>{successMessage}</p></div>}
            <button onClick={openScanner} className={styles.openButton}><FiMaximize /> Open Scanner</button>
          </div>
        )}
      </div>

      <div className={styles.attendeesSection}>
        <div className={styles.tableHeader}><FiUsers /><h2>Attendee List</h2></div>
        {isLoading ? <p className={styles.loadingText}>Loading attendees...</p> : <AttendeesTable attendees={attendees} onCheckIn={handleCheckIn} />}
      </div>
    </div>
  );
};

export default ScannerPage;