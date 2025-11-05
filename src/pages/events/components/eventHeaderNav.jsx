import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './eventHeaderNav.module.scss';
import GenerateScannerIdModal from './generateScannerIdModal';

// --- SVG Icons ---
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const ScannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
  </svg>
);

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V18M12 6V4M20 12H18M6 12H4M18.36 18.36L17 17M7.05 7.05L5.64 5.64M18.36 5.64L17 7.05M7.05 17L5.64 18.36M12 16a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

// --- Main Component ---
const EventHeaderNav = ({
  eventName,
  eventId,
  isDraft,
  toggleMobileSidebar,
  children, // Accept children prop
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyLink = () => {
    const eventLink = `https://www.prizmatix.nz/events/${eventId}`;
    navigator.clipboard.writeText(eventLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      setIsActionMenuOpen(false);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleOpenScannerModal = () => {
    setIsModalOpen(true);
    setIsActionMenuOpen(false);
  };

  return (
    <>
      <nav className={styles.eventNav}>
        {children ? ( // If children are provided, render them.
          children
        ) : ( // Otherwise, render the default header content.
          <>
            <button className={styles.mobileSidebarToggleButton} onClick={toggleMobileSidebar} aria-label="Open menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="currentColor"/>
              </svg>
            </button>
            <div className={styles.breadcrumbContainer}>
              <div className={styles.breadcrumb}>
                <Link to="/events" className={styles.breadcrumbLink}>Events</Link>
                <span className={styles.breadcrumbSeparator}><ArrowIcon /></span>
                <Link to={`/events/manage/${eventId}/overview`} className={styles.breadcrumbLink}>{eventName}</Link>
                {isDraft && <span className={styles.breadcrumbDraft}>Live</span>}
              </div>
            </div>
            <div className={styles.actionButtonsContainer} ref={actionMenuRef}>
              <button className={styles.mobileActionsButton} onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}>
                <GearIcon />
              </button>
              <div className={`${styles.actionButtons} ${isActionMenuOpen ? styles.active : ''}`}>
                <button className={styles.generateButton} onClick={handleOpenScannerModal}>
                  <ScannerIcon />
                  <span>Generate Scanner ID</span>
                </button>
                <button
                  className={styles.copyLinkButton}
                  onClick={handleCopyLink}
                  data-copied-tooltip={isCopied ? 'Copied!' : 'Copy event link'}
                >
                  <LinkIcon />
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Modal is kept outside the conditional rendering */}
      {!children && (
        <GenerateScannerIdModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignedEventId={eventId}
        />
      )}
    </>
  );
};

EventHeaderNav.propTypes = {
  eventName: PropTypes.string,
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isDraft: PropTypes.bool,
  toggleMobileSidebar: PropTypes.func,
  children: PropTypes.node, // Added children to prop types
};

EventHeaderNav.defaultProps = {
  eventName: '',
  eventId: null,
  isDraft: true,
  toggleMobileSidebar: () => {},
  children: null,
};

export default EventHeaderNav;