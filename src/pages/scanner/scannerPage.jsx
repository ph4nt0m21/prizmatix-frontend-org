import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import styles from './scannerPage.module.scss';
import { FiXCircle, FiCheckCircle, FiMaximize, FiUsers } from 'react-icons/fi';
import AttendeesTable from './components/attendeesTable';
import { GetAttendeeScanner, CheckInAttendeeAPI, CheckoutAttendeeAPI, VerifyQrCodeAPI } from '../../services/allApis';

const ScannerPage = () => {
  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data & UI State
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch attendees from scanner API
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true);
        const response = await GetAttendeeScanner(); // no eventId needed
        const formatted = response.data.map((a) => ({
          id: a.ticketId,
          name: a.attendeeName,
          ticketType: a.ticketType,
          isCheckedIn: a.checkedIn,
          checkedInAt: a.checkedInAt,
        }));
        setAttendees(formatted);
      } catch (err) {
        console.error("Failed to fetch attendees:", err);
        setError('Could not load the attendee list.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, []);

  const handleScan = async (data) => {
  if (data) {
    const qrContent = data.text.trim();

    setScannedData({ text: qrContent, timestamp: new Date().toLocaleTimeString() });
    setError(null);
    setSuccessMessage(null);
    setIsScannerOpen(false);

    try {
  const response = await VerifyQrCodeAPI({ qrContent }); // Pass as { qrContent }
  const { orderId, eventName, attendees: attendeesFromOrder } = response.data;

  const formattedAttendees = attendeesFromOrder.map((a) => ({
    id: a.ticketId,
    name: a.attendeeName,
    ticketType: a.ticketType,
    isCheckedIn: a.checkedIn,
    checkedInAt: a.checkedInAt,
  }));

  setAttendees(formattedAttendees);
  setSuccessMessage(`Order #${orderId} verified for ${eventName}. Found ${formattedAttendees.length} attendees.`);
} catch (err) {
  console.error("QR verification failed:", err);
  setError("Invalid QR Code or ticket does not belong to this event.");
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

  // ✅ Toggle check-in (optimistic UI, later connect API)
  const handleToggleCheckIn = async (ticketId, isCurrentlyCheckedIn) => {
  try {
    if (isCurrentlyCheckedIn) {
      // Checkout
      await CheckoutAttendeeAPI(ticketId);
      setAttendees(current =>
        current.map(att =>
          att.id === ticketId ? { ...att, isCheckedIn: false, checkedInAt: null } : att
        )
      );
    } else {
      // Checkin
      await CheckInAttendeeAPI(ticketId);
      setAttendees(current =>
        current.map(att =>
          att.id === ticketId ? { ...att, isCheckedIn: true, checkedInAt: new Date().toISOString() } : att
        )
      );
    }
  } catch (err) {
    console.error("Check-in/out failed:", err);
    setError("Failed to update attendee status. Please try again.");
  }
};

  const cameraConstraints = { video: { facingMode: 'environment' } };

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.contentWrapper}>
        <h1>Ticket Scanner</h1>
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
            {error && <div className={`${styles.resultBox} ${styles.error}`}><FiXCircle size={24} /> <p>{error}</p></div>}
            {successMessage && <div className={`${styles.resultBox} ${styles.success}`}><FiCheckCircle size={24} /><p>{successMessage}</p></div>}
            <button onClick={openScanner} className={styles.openButton}><FiMaximize /> Open Scanner</button>
          </div>
        )}
      </div>

      <div className={styles.attendeesSection}>
        <div className={styles.tableHeader}><FiUsers /><h2>Attendee List</h2></div>
        {isLoading ? (
          <p className={styles.loadingText}>Loading attendees...</p>
        ) : (
          <AttendeesTable attendees={attendees} onToggleCheckIn={handleToggleCheckIn} />
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
