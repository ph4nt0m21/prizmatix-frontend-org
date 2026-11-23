import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import styles from './scannerPage.module.scss';
import { FiXCircle, FiCheckCircle, FiMaximize, FiUsers } from 'react-icons/fi';
import AttendeesTable from './components/attendeesTable';
import ScanResultModal from './components/scanResultModal';
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

const SCANNER_REGION_ID = 'ticket-qr-scanner-region';

// html5-qrcode rejects Html5Qrcode#start() with plain strings, not typed
// errors (see its source: `Html5QrcodeStrings.errorGettingUserMedia` wraps
// the underlying DOMException as "Error getting userMedia, error = <name>: ..."
// and unsupported browsers get a fixed "Camera streaming not supported by
// the browser." string) — so we pattern-match those strings here to turn
// them into guidance staff can actually act on at an event.
const describeCameraError = (err) => {
  const message = typeof err === 'string' ? err : err?.message || String(err);

  if (/camera streaming not supported/i.test(message)) {
    return "This browser can't access the camera here. If you opened this link inside an app (WhatsApp, Instagram, Facebook, etc.), tap the menu (⋯) and choose \"Open in Browser\" (Safari or Chrome), then try again.";
  }
  if (/NotAllowedError|PermissionDeniedError/.test(message)) {
    return "Camera access is blocked for this site. Open your browser's site settings, allow Camera, then reload the page.";
  }
  if (/NotFoundError|DevicesNotFoundError/.test(message)) {
    return 'No camera was found on this device.';
  }
  if (/NotReadableError|TrackStartError/.test(message)) {
    return 'The camera is already in use by another app. Close other apps using the camera and try again.';
  }
  if (/OverconstrainedError|ConstraintNotSatisfiedError/.test(message)) {
    return "This device's camera doesn't support the required settings.";
  }
  if (/SecurityError/.test(message)) {
    return 'Camera access requires a secure (https) connection.';
  }
  return 'Could not access the camera. Please check camera permissions for this site and try again.';
};

const normalizeRole = (role) => (role || '').replace(/^ROLE_/, '');

const serverMessageOf = (err) =>
  typeof err?.response?.data === 'string' ? err.response.data : err?.response?.data?.message;

// Check one ticket in. Another scanner (or another tab) may have checked it in
// since the list loaded; the server answers 409 then, and the ticket is in, so
// that counts as checked in rather than as a failure.
const checkInTicket = async (ticketId) => {
  try {
    await CheckInAttendeeAPI(ticketId);
    return 'checked-in';
  } catch (err) {
    if (err?.response?.status === 409) return 'already-checked-in';
    throw err;
  }
};

const describeCheckInError = (err) => {
  const serverMessage = serverMessageOf(err);
  return serverMessage && /revoked/i.test(serverMessage)
    ? 'This ticket has been revoked and is not valid for entry.'
    : 'Failed to update check-in status. Please try again.';
};

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
  // The order behind the last scanned QR code, shown in the pop-up:
  // { orderId, eventName, ids, alreadyCheckedInIds: Set, error }
  const [scanResult, setScanResult] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const scanInFlightRef = useRef(false);
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

  const handleScan = async (decodedText) => {
    // html5-qrcode can report the same code on several frames before the
    // camera stops; verify it once.
    if (!decodedText || scanInFlightRef.current) return;
    scanInFlightRef.current = true;

    setHasScanned(true);
    const qrContent = decodedText.trim();
    setError(null);
    setSuccessMessage(null);
    closeScanner();

    try {
      const response = await VerifyQrCodeAPI({ qrContent });
      const { orderId, eventName, attendees: attendeesFromOrder } = response.data;

      // A QR code identifies an order. Its tickets and donations are what
      // staff check in, so show exactly those in the pop-up.
      const scannedRows = mapTicketRows(attendeesFromOrder || []);
      const scannedById = new Map(scannedRows.map((a) => [a.id, a]));
      setTicketRows((current) => {
        const knownIds = new Set(current.map((row) => row.id));
        // Bought after the list loaded: add it, so the pop-up and the list agree.
        const added = scannedRows.filter((row) => !knownIds.has(row.id));
        return [...current.map((row) => scannedById.get(row.id) || row), ...added];
      });

      const hasDonators = scannedRows.some((r) => r.isDonation);
      const hasAttendees = scannedRows.some((r) => !r.isDonation);
      if (hasDonators && !hasAttendees) {
        setListTab('Donators');
      } else if (hasAttendees) {
        setListTab('Attendees');
      }

      setScanResult({
        orderId,
        eventName,
        ids: scannedRows.map((r) => r.id),
        alreadyCheckedInIds: new Set(scannedRows.filter((r) => r.isCheckedIn).map((r) => r.id)),
        error: null,
      });
    } catch (err) {
      console.error('QR verification failed:', err);
      const serverMessage = serverMessageOf(err);
      // A revoked ticket is a definite "no" — say so, so door staff don't keep re-scanning.
      setError(
        serverMessage && /revoked/i.test(serverMessage)
          ? 'This ticket has been revoked and is not valid for entry.'
          : 'Invalid QR Code or ticket does not belong to this event.'
      );
    } finally {
      scanInFlightRef.current = false;
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError(describeCameraError(err));
    setIsScannerOpen(false);
  };

  const openScanner = async () => {
    setError(null);
    setSuccessMessage(null);

    const config = {
      fps: 10,
      // The qrbox we return here is the exact region html5-qrcode both
      // draws as the shaded viewfinder AND decodes QR codes from, so the
      // visible scan box and the real detection region can never drift apart.
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
        return { width: edge, height: edge };
      },
      aspectRatio: 1.0,
    };

    try {
      // Every call that can throw stays inside this try, the constructor
      // included — it throws synchronously when its target element is
      // missing. Anything escaping here reaches the route's ErrorBoundary
      // and replaces the whole page with "Something went wrong / Try Again"
      // instead of a message explaining what to do about the camera.
      const html5Qr = new Html5Qrcode(SCANNER_REGION_ID);
      html5QrRef.current = html5Qr;

      // Requesting the camera here, directly inside the click handler
      // (rather than in a useEffect that reacts to state a render later),
      // keeps getUserMedia tied to the user's tap. Some in-app/embedded
      // mobile browsers (WhatsApp, Instagram, Facebook, etc.) silently
      // refuse camera access — no permission prompt at all — once that
      // gesture link is broken, which matches reports of the scanner
      // just not opening with no dialog ever appearing.
      await html5Qr.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => handlersRef.current.handleScan(decodedText),
        () => {
          // Per-frame "no QR code found" callback — expected on every
          // frame without a code in view, not an error worth surfacing.
        }
      );
      setIsScannerOpen(true);
    } catch (err) {
      html5QrRef.current = null;
      handleError(err);
    }
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
    stopScanner();
  };

  const markCheckedIn = (ids) => {
    const now = new Date().toISOString();
    setTicketRows((current) =>
      current.map((att) =>
        ids.has(att.id) && !att.isCheckedIn ? { ...att, isCheckedIn: true, checkedInAt: now } : att
      )
    );
  };

  const markCheckedOut = (ticketId) => {
    setTicketRows((current) =>
      current.map((att) =>
        att.id === ticketId ? { ...att, isCheckedIn: false, checkedInAt: null } : att
      )
    );
  };

  // Shared by the attendee list and the scan pop-up, so both check people in
  // the same way. Returns an error message, or null when it worked.
  const toggleCheckIn = async (ticketId, isCurrentlyCheckedIn) => {
    try {
      if (isCurrentlyCheckedIn) {
        await CheckoutAttendeeAPI(ticketId);
        markCheckedOut(ticketId);
      } else {
        await checkInTicket(ticketId);
        markCheckedIn(new Set([ticketId]));
      }
      return null;
    } catch (err) {
      console.error('Check-in/out failed:', err);
      return describeCheckInError(err);
    }
  };

  const handleToggleCheckIn = async (ticketId, isCurrentlyCheckedIn) => {
    const message = await toggleCheckIn(ticketId, isCurrentlyCheckedIn);
    if (message) setError(message);
  };

  const setScanError = (message) =>
    setScanResult((current) => (current ? { ...current, error: message } : current));

  const withPending = async (ids, action) => {
    setPendingIds((current) => new Set([...current, ...ids]));
    try {
      return await action();
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleScanToggle = (ticketId, isCurrentlyCheckedIn) =>
    withPending([ticketId], async () => {
      setScanError(null);
      const message = await toggleCheckIn(ticketId, isCurrentlyCheckedIn);
      if (message) {
        setScanError(message);
      } else if (isCurrentlyCheckedIn) {
        // Undone on purpose: no longer "used before this scan".
        setScanResult((current) => {
          if (!current) return current;
          const alreadyCheckedInIds = new Set(current.alreadyCheckedInIds);
          alreadyCheckedInIds.delete(ticketId);
          return { ...current, alreadyCheckedInIds };
        });
      }
    });

  const handleScanCheckInAll = () => {
    if (!scanResult) return;
    const idsInOrder = new Set(scanResult.ids);
    const unchecked = ticketRows
      .filter((row) => idsInOrder.has(row.id) && !row.isCheckedIn)
      .map((row) => row.id);
    if (unchecked.length === 0) return;

    return withPending(unchecked, async () => {
      setScanError(null);
      // allSettled, not all: one failure must not hide the ones that worked.
      const results = await Promise.allSettled(unchecked.map((id) => checkInTicket(id)));
      const done = new Set(unchecked.filter((_, i) => results[i].status === 'fulfilled'));
      markCheckedIn(done);
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('Check-in failed:', failed.map((r) => r.reason));
        setScanError(
          failed.length === unchecked.length
            ? describeCheckInError(failed[0].reason)
            : `${failed.length} of ${unchecked.length} could not be checked in. Please try them again.`
        );
      }
    });
  };

  const closeScanResult = () => setScanResult(null);

  const handleScanNext = () => {
    setScanResult(null);
    // Still inside the tap, so the camera request keeps its user gesture.
    openScanner();
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

  const handlersRef = useRef({ handleScan, handleError });
  handlersRef.current = { handleScan, handleError };

  const html5QrRef = useRef(null);

  const stopScanner = async () => {
    const instance = html5QrRef.current;
    html5QrRef.current = null;
    if (!instance) return;
    try {
      if (instance.getState() === Html5QrcodeScannerState.SCANNING) {
        await instance.stop();
      }
      await instance.clear();
    } catch (err) {
      console.error('Failed to stop scanner:', err);
    }
  };

  // Release the camera if the user navigates away while it's open.
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDonatorsTab = listTab === 'Donators';

  // The pop-up reads the live rows, so a check-in shows in it and in the list at once.
  const scanItems = useMemo(() => {
    if (!scanResult) return [];
    const rowsById = new Map(ticketRows.map((row) => [row.id, row]));
    return scanResult.ids.map((id) => rowsById.get(id)).filter(Boolean);
  }, [scanResult, ticketRows]);

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
        <div
          className={`${styles.scannerActive} ${!isScannerOpen ? styles.scannerActiveHidden : ''}`}
        >
          <div className={styles.scannerPreview}>
            <div id={SCANNER_REGION_ID} className={styles.scannerRegion} />
          </div>
          <button onClick={closeScanner} className={styles.closeButton}>
            <FiXCircle /> Close Scanner
          </button>
        </div>
        {!isScannerOpen && (
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

      {scanResult && (
        <ScanResultModal
          orderId={scanResult.orderId}
          eventName={scanResult.eventName}
          items={scanItems}
          alreadyCheckedInIds={scanResult.alreadyCheckedInIds}
          pendingIds={pendingIds}
          error={scanResult.error}
          onCheckIn={(id) => handleScanToggle(id, false)}
          onUndo={(id) => handleScanToggle(id, true)}
          onCheckInAll={handleScanCheckInAll}
          onScanNext={handleScanNext}
          onClose={closeScanResult}
        />
      )}
    </div>
  );
};

export default ScannerPage;
