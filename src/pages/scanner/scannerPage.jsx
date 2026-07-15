import React, { useState, useEffect, useMemo } from 'react';
import QrScanner from 'react-qr-scanner';
import styles from './scannerPage.module.scss';
import { FiXCircle, FiCheckCircle, FiMaximize, FiUsers } from 'react-icons/fi';
import AttendeesTable from './components/attendeesTable';
import Toolbar from '../reports/components/toolbar';
import {
  GetAllOrganizationEventsAPI,
  GetAttendeeScanner,
  CheckInAttendeeAPI,
  CheckoutAttendeeAPI,
  VerifyQrCodeAPI,
} from '../../services/allApis';
import { getUserData } from '../../utils/authUtil';
import EventCombobox from '../../components/common/eventCombobox/eventCombobox';

const normalizeRole = (role) => (role || '').replace(/^ROLE_/, '');

const mapTicketRows = (list = []) =>
  list.map((a, index) => ({
    id: a.ticketId || `att-${index}`,
    name: a.attendeeName || 'Unknown',
    ticketType: a.ticketType || 'N/A',
    isCheckedIn: !!a.checkedIn,
    checkedInAt: a.checkedInAt || null,
    orderDate: a.orderDate,
    orderId: a.orderId != null ? `#${a.orderId}` : '',
    email: a.attendeeEmail || '',
    donationNote: a.donationNote || '',
    isDonation: !!a.donation,
  }));

const ScannerPage = () => {
  const userData = getUserData();
  const userRole = normalizeRole(userData?.role);
  const isScannerUser = userRole === 'SCANNER';
  const assignedEventId = userData?.assignedEventId;

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [ticketRows, setTicketRows] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(
    isScannerUser && assignedEventId ? String(assignedEventId) : ''
  );
  const [listTab, setListTab] = useState('Attendees');
  const [isLoading, setIsLoading] = useState(true);
  const [isEventLoading, setIsEventLoading] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendeeFilters, setAttendeeFilters] = useState({
    ticketType: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchOrganizationEvents = async () => {
      try {
        setIsEventLoading(true);
        setError(null);

        if (isScannerUser) {
          if (!assignedEventId) {
            setEvents([{ id: 'assigned', name: 'Assigned event' }]);
            setSelectedEventId('assigned');
            return;
          }
          setEvents([{ id: assignedEventId, name: `Assigned event (#${assignedEventId})` }]);
          setSelectedEventId(String(assignedEventId));
          return;
        }

        const orgId = userData?.organizationId;
        if (!orgId) {
          setError('Organisation not found. Please login again.');
          setEvents([]);
          return;
        }

        const response = await GetAllOrganizationEventsAPI(orgId);
        const list = Array.isArray(response.data) ? response.data : response.data?.content || [];
        setEvents(list);
      } catch (err) {
        console.error('Failed to fetch organization events:', err);
        setError('Could not load organisation events.');
      } finally {
        setIsEventLoading(false);
      }
    };

    fetchOrganizationEvents();
  }, [isScannerUser, assignedEventId, userData?.organizationId]);

  useEffect(() => {
    const fetchTicketsForEvent = async () => {
      if (!selectedEventId) {
        setTicketRows([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const eventIdForApi =
          selectedEventId === 'assigned'
            ? assignedEventId || undefined
            : Number(selectedEventId);
        const response = await GetAttendeeScanner(eventIdForApi);
        setTicketRows(mapTicketRows(response.data || []));
      } catch (err) {
        console.error('Failed to fetch scanner tickets:', err);
        setError('Could not load list for the selected event.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketsForEvent();
  }, [selectedEventId, assignedEventId]);

  const tabRows = useMemo(() => {
    const wantDonators = listTab === 'Donators';
    return ticketRows.filter((row) => !!row.isDonation === wantDonators);
  }, [ticketRows, listTab]);

  const filteredRows = useMemo(() => {
    return tabRows.filter((row) => {
      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.ticketType && row.ticketType.toLowerCase().includes(q)) ||
        (row.email && row.email.toLowerCase().includes(q)) ||
        (row.orderId && String(row.orderId).toLowerCase().includes(q)) ||
        (row.donationNote && row.donationNote.toLowerCase().includes(q));

      const ticketTypeMatch =
        listTab === 'Donators' ||
        attendeeFilters.ticketType === 'All' ||
        row.ticketType === attendeeFilters.ticketType;

      const statusMatch =
        attendeeFilters.status === 'All' ||
        (attendeeFilters.status === 'Checked In' && row.isCheckedIn) ||
        (attendeeFilters.status === 'Not Checked In' && !row.isCheckedIn);

      let dateMatch = true;
      if (attendeeFilters.startDate || attendeeFilters.endDate) {
        const od = row.orderDate ? new Date(row.orderDate) : null;
        if (!od || Number.isNaN(od.getTime())) {
          dateMatch = false;
        } else {
          if (attendeeFilters.startDate) {
            dateMatch = dateMatch && od >= new Date(attendeeFilters.startDate);
          }
          if (attendeeFilters.endDate) {
            const endDate = new Date(attendeeFilters.endDate);
            endDate.setHours(23, 59, 59, 999);
            dateMatch = dateMatch && od <= endDate;
          }
        }
      }

      return searchMatch && ticketTypeMatch && statusMatch && dateMatch;
    });
  }, [tabRows, searchQuery, attendeeFilters, listTab]);

  const ticketTypes = useMemo(() => {
    const types = [
      ...new Set(
        ticketRows
          .filter((a) => !a.isDonation)
          .map((a) => a.ticketType)
          .filter(Boolean)
      ),
    ];
    return ['All', ...types];
  }, [ticketRows]);

  const handleScan = async (data) => {
    if (data) {
      setHasScanned(true);
      const qrContent = data.text.trim();
      setError(null);
      setSuccessMessage(null);
      setIsScannerOpen(false);

      try {
        const response = await VerifyQrCodeAPI({ qrContent });
        const { orderId, eventName, attendees: attendeesFromOrder } = response.data;

        const scannedRows = mapTicketRows(attendeesFromOrder || []);
        const scannedById = new Map(scannedRows.map((a) => [a.id, a]));
        setTicketRows((current) =>
          current.map((row) => scannedById.get(row.id) || row)
        );

        const hasDonators = scannedRows.some((r) => r.isDonation);
        const hasAttendees = scannedRows.some((r) => !r.isDonation);
        if (hasDonators && !hasAttendees) {
          setListTab('Donators');
        } else if (hasAttendees) {
          setListTab('Attendees');
        }

        setSuccessMessage(
          `Order #${orderId} verified for ${eventName}. Found ${scannedRows.length} ticket(s).`
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
    setError(null);
    setSuccessMessage(null);
    setIsScannerOpen(true);
  };

  const handleToggleCheckIn = async (ticketId, isCurrentlyCheckedIn) => {
    try {
      if (isCurrentlyCheckedIn) {
        await CheckoutAttendeeAPI(ticketId);
        setTicketRows((current) =>
          current.map((att) =>
            att.id === ticketId ? { ...att, isCheckedIn: false, checkedInAt: null } : att
          )
        );
      } else {
        await CheckInAttendeeAPI(ticketId);
        setTicketRows((current) =>
          current.map((att) =>
            att.id === ticketId
              ? { ...att, isCheckedIn: true, checkedInAt: new Date().toISOString() }
              : att
          )
        );
      }
    } catch (err) {
      console.error('Check-in/out failed:', err);
      setError('Failed to update check-in status. Please try again.');
    }
  };

  const handleCheckInAll = async () => {
    const label = listTab === 'Donators' ? 'donator' : 'attendee';
    try {
      const unchecked = filteredRows.filter((a) => !a.isCheckedIn);
      if (unchecked.length === 0) {
        setSuccessMessage(`All ${label}s are already checked in.`);
        return;
      }

      await Promise.all(unchecked.map((att) => CheckInAttendeeAPI(att.id)));

      const checkedIds = new Set(unchecked.map((a) => a.id));
      setTicketRows((current) =>
        current.map((a) =>
          checkedIds.has(a.id)
            ? { ...a, isCheckedIn: true, checkedInAt: new Date().toISOString() }
            : a
        )
      );

      setSuccessMessage(`Checked in ${unchecked.length} ${label}(s) successfully.`);
    } catch (err) {
      console.error('Bulk check-in failed:', err);
      setError(`Failed to check in all ${label}s. Please try again.`);
    }
  };

  const cameraConstraints = { video: { facingMode: 'environment' } };
  const isDonatorsTab = listTab === 'Donators';

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.contentWrapper}>
        <h1>Ticket Scanner</h1>
        <div className={styles.eventSelectorRow}>
          <label htmlFor="event-selector" className={styles.eventSelectorLabel}>
            Event
          </label>
          <EventCombobox
            id="event-selector"
            events={events}
            valueId={selectedEventId}
            onChange={(id) => {
              if (isScannerUser) return;
              setSelectedEventId(id);
              setHasScanned(false);
              setSuccessMessage(null);
              setError(null);
              setSearchQuery('');
              setListTab('Attendees');
              setAttendeeFilters({
                ticketType: 'All',
                status: 'All',
                startDate: '',
                endDate: '',
              });
            }}
            disabled={isScannerUser || isEventLoading || events.length === 0}
            loading={isEventLoading}
            emptyListMessage="No events available"
          />
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
          <div className={styles.tabs} role="tablist" aria-label="Scanner lists">
            <button
              type="button"
              role="tab"
              aria-selected={listTab === 'Attendees'}
              className={`${styles.tabButton} ${listTab === 'Attendees' ? styles.tabActive : ''}`}
              onClick={() => {
                setListTab('Attendees');
                setSearchQuery('');
                setAttendeeFilters((prev) => ({ ...prev, ticketType: 'All' }));
              }}
            >
              Attendees
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listTab === 'Donators'}
              className={`${styles.tabButton} ${listTab === 'Donators' ? styles.tabActive : ''}`}
              onClick={() => {
                setListTab('Donators');
                setSearchQuery('');
                setAttendeeFilters((prev) => ({ ...prev, ticketType: 'All' }));
              }}
            >
              Donators
            </button>
          </div>
          {hasScanned && filteredRows.length > 0 && (
            <button className={styles.checkInAllButton} onClick={handleCheckInAll}>
              Check In All
            </button>
          )}
        </div>

        {isLoading ? (
          <p className={styles.loadingText}>
            {isDonatorsTab ? 'Loading donators...' : 'Loading attendees...'}
          </p>
        ) : !selectedEventId ? (
          <p className={styles.loadingText}>Select an event to see the list.</p>
        ) : (
          <>
            <div className={styles.toolbarRow}>
              <Toolbar
                activeTab={isDonatorsTab ? 'Donation Notes' : 'Attendees'}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                data={filteredRows}
                currentFilters={attendeeFilters}
                onApplyFilters={setAttendeeFilters}
                ticketTypes={ticketTypes}
              />
            </div>
            <AttendeesTable
              attendees={filteredRows}
              onToggleCheckIn={handleToggleCheckIn}
              mode={isDonatorsTab ? 'donators' : 'attendees'}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
