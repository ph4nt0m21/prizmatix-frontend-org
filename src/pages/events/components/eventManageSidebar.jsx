import React from "react";
import PropTypes from "prop-types";
import styles from "./eventManageSidebar.module.scss";

/**
 * EventManageSidebar component displays the sections for event management
 * and tracks the current active section. It is mobile responsive.
 *
 * @param {Object} props Component props
 * @param {string} props.currentSection - The currently active section key.
 * @param {Object} props.sectionStatus - Object containing completion/visited status for each section.
 * @param {Function} props.navigateToSection - Function to navigate to a specific section.
 * @param {Function} props.navigateToEventEditPage - Function to navigate to the event edit page.
 * @param {string} props.eventId - The ID of the event being managed.
 * @param {boolean} props.isMobileSidebarOpen - Controls if the sidebar is open on mobile.
 * @param {Function} props.toggleMobileSidebar - Function to toggle mobile sidebar visibility.
 * @returns {JSX.Element} EventManageSidebar component
 */
const EventManageSidebar = ({
  currentSection,
  sectionStatus,
  navigateToSection,
  navigateToEventEditPage,
  eventId,
  isMobileSidebarOpen,
  toggleMobileSidebar
}) => {
  const sections = [
    // Manage Event section
    {
      key: "overview",
      label: "Overview",
      icon: (
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 7.50016H2.5" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M7.18424 7.5V17.5" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path fillRule="evenodd" clipRule="evenodd" d="M15.8333 17.5H4.16667C3.24583 17.5 2.5 16.7542 2.5 15.8333V4.16667C2.5 3.24583 3.24583 2.5 4.16667 2.5H15.8333C16.7542 2.5 17.5 3.24583 17.5 4.16667V15.8333C17.5 16.7542 16.7542 17.5 15.8333 17.5Z" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

      ),
      group: "manage",
    },
    {
      key: "ordersAndAttendees",
      label: "Orders & Attendees",
      icon: (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M1.66602 15.8333C1.66602 14 3.16602 12.5 4.99935 12.5H8.33268C10.166 12.5 11.666 14 11.666 15.8333" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.74925 5.00029C9.91591 6.16696 9.91591 8.00029 8.74925 9.08362C7.58258 10.167 5.74925 10.2503 4.66591 9.08362C3.58258 7.91696 3.49925 6.16696 4.58258 5.00029C5.66591 3.83362 7.58258 3.91696 8.74925 5.00029" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.334 11.667H15.834C17.2507 11.667 18.334 12.7503 18.334 14.167" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16.0831 5.5835C16.9164 6.41683 16.9164 7.75016 16.0831 8.50016C15.2498 9.25016 13.9164 9.3335 13.1664 8.50016C12.4164 7.66683 12.3331 6.3335 13.1664 5.5835C13.9164 4.8335 15.2498 4.8335 16.0831 5.5835" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
      ),
      group: "manage",
    },
    {
      key: "payout",
      label: "Payout",
      icon: (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M10.0007 11.5916C10.9211 11.5916 11.6673 10.8454 11.6673 9.92497C11.6673 9.00449 10.9211 8.2583 10.0007 8.2583C9.08018 8.2583 8.33398 9.00449 8.33398 9.92497C8.33398 10.8454 9.08018 11.5916 10.0007 11.5916Z" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M16.5033 15.1777V15.1777C14.4158 14.7602 12.2625 14.8119 10.1975 15.3277L10 15.3777C7.805 15.9261 5.51583 15.9811 3.2975 15.5369L3.17 15.5111C2.78 15.4336 2.5 15.0911 2.5 14.6944V5.66191C2.5 5.13608 2.98083 4.74191 3.49667 4.84441V4.84441C5.58417 5.26191 7.7375 5.21024 9.8025 4.69441L10.1967 4.59608C12.2617 4.08024 14.4158 4.02858 16.5025 4.44608L16.8292 4.51108C17.22 4.58941 17.5 4.93108 17.5 5.32858V14.3611C17.5 14.8869 17.0192 15.2811 16.5033 15.1777V15.1777Z" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.0007 6.73007C14.4457 6.67924 13.8898 6.65674 13.334 6.67091" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5 13.2743C5.555 13.3252 6.11083 13.3468 6.66667 13.3335" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
      ),
      group: "manage",
    },
    // { // REMOVED PROMOTIONS SECTION
    //   key: "promotions",
    //   label: "Promotions",
    //   icon: ( ... ),
    //   group: "manage",
    // },

    // Edit Event Pages - these are distinct pages
    {
      key: "eventPage",
      label: "Event Page",
      icon: (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M6.66602 13.3332H13.3327" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <rect x="2.5" y="2.5" width="15" height="15" rx="5" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M12.257 8.86209L10.53 10.5891C10.3737 10.7454 10.1617 10.8332 9.94071 10.8332H8.54232C8.42726 10.8332 8.33398 10.7399 8.33398 10.6249V9.22642C8.33399 9.00545 8.42175 8.79353 8.57798 8.63726L10.304 6.9107C10.4603 6.75436 10.6722 6.66652 10.8933 6.6665C11.1143 6.66649 11.3263 6.75429 11.4826 6.9106L12.2563 7.68427C12.4126 7.84034 12.5005 8.05213 12.5007 8.27303C12.5008 8.49393 12.4132 8.70583 12.257 8.86209V8.86209Z" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
      ),
      group: "page", // Changed group to 'page' to differentiate from 'manage'
    },
    {
      key: "tickets",
      label: "Tickets",
      icon: (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M15.416 5.83317H14.9993" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="11.6667" cy="8.11296" r="1.66667" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <rect x="5.41602" y="3.3335" width="12.5" height="9.58333" rx="2.5" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.4173 12.9042V14.5832C15.4173 15.7338 14.4846 16.6665 13.334 16.6665H4.16732C3.01672 16.6665 2.08398 15.7338 2.08398 14.5832V8.74984C2.08398 7.59924 3.01672 6.6665 4.16732 6.6665H5.41732" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M7.91732 10.4167H8.33398" stroke="#383C51" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
      ),
      group: "manage", // Changed group to 'manage'
    },
    {
      key: "discounts",
      label: "Discounts",
      icon: (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M5.79932 11.4957L8.19932 9.0957" stroke="#52525B" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.30802 11.4119C8.36202 11.4659 8.36202 11.5525 8.30802 11.6059C8.25402 11.6599 8.16735 11.6599 8.11402 11.6059C8.06002 11.5519 8.06002 11.4652 8.11402 11.4119C8.16735 11.3585 8.25469 11.3585 8.30802 11.4119" stroke="#52525B" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5.88529 8.98621C5.93929 9.04021 5.93929 9.12687 5.88529 9.18021C5.83129 9.23421 5.74462 9.23421 5.69129 9.18021C5.63795 9.12621 5.63729 9.03954 5.69129 8.98621C5.74529 8.93288 5.83195 8.93221 5.88529 8.98621" stroke="#52525B" strokeLinecap="round" strokeLinejoin="round"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M10.6667 14.0003H3.33333C2.59667 14.0003 2 13.4037 2 12.667V8.00033C2 7.26366 2.59667 6.66699 3.33333 6.66699H10.6667C11.4033 6.66699 12 7.26366 12 8.00033V12.667C12 13.4037 11.4033 14.0003 10.6667 14.0003Z" stroke="#52525B" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4 6.66699V4.00033C4 3.26366 4.59667 2.66699 5.33333 2.66699H12.6667C13.4033 2.66699 14 3.26366 14 4.00033V8.66699C14 9.40366 13.4033 10.0003 12.6667 10.0003H12" stroke="#52525B" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
      ),
      group: "manage",
    },
  ];

  /**
   * Get CSS class for a section based on its status
   * @param {Object} section Section object
   * @returns {string} CSS class
   */
  const getSectionClass = (section) => {
    const status = sectionStatus[section.key] || {};
    const isActive = currentSection === section.key;

    if (section.group === "manage" && isActive)
      return `${styles.sectionItem} ${styles.active}`;
    if (section.group === "manage" && status && status.completed)
      return `${styles.sectionItem} ${styles.completed}`;
    if (section.group === "manage" && status && status.visited)
      return `${styles.sectionItem} ${styles.visited}`;
    
    return styles.sectionItem;
  };

  /**
   * Handle click on a section item.
   * Also closes the mobile sidebar if it's open.
   * @param {string} sectionKey - Key of the section to navigate to
   */
  const handleSectionClick = (sectionKey) => {
    const section = sections.find(s => s.key === sectionKey);
    if (!section) return;

    if (section.key !== 'overview' && !eventId) {
      alert("Event ID is required to manage this event section.");
      return;
    }

    if (section.group === "manage") {
      navigateToSection(section.key);
    } else if (section.key === "eventPage") {
      navigateToEventEditPage();
    }

    if (window.innerWidth <= 768 && isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  return (
    <div className={`${styles.sidebar} ${isMobileSidebarOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Manage Event</h2>
        <p className={styles.sidebarSubtitle}>Event management options</p>
      </div>

      <div className={styles.sectionsList}>
        {/* Manage Event Sections */}
        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Manage Event</h3>
          {sections.filter(s => s.group === 'manage' && s.key !== 'tickets' && s.key !== 'discounts' && s.key !== 'eventPage').map((section) => {
            return (
              <div
                key={section.key}
                className={getSectionClass(section)}
                onClick={() => handleSectionClick(section.key)}
              >
                <div className={styles.sectionIconContainer}>
                  {section.icon}
                </div>
                <span className={styles.sectionLabel}>{section.label}</span>
              </div>
            );
          })}
        </div>

        {/* Edit Event Pages */}
        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Edit Event</h3>
          {sections.filter(s => s.key === 'eventPage').map((section) => (
            <div
              key={section.key}
              className={styles.sectionItem}
              onClick={() => handleSectionClick(section.key)}
            >
              <div className={styles.sectionIconContainer}>
                {section.icon}
              </div>
              <span className={styles.sectionLabel}>{section.label}</span>
            </div>
          ))}
          {sections.filter(s => s.key === 'tickets').map((section) => {
            return (
              <div
                key={section.key}
                className={getSectionClass(section)}
                onClick={() => handleSectionClick(section.key)}
              >
                <div className={styles.sectionIconContainer}>
                  {section.icon}
                </div>
                <span className={styles.sectionLabel}>{section.label}</span>
              </div>
            );
          })}
          {sections.filter(s => s.key === 'discounts').map((section) => {
            return (
              <div
                key={section.key}
                className={getSectionClass(section)}
                onClick={() => handleSectionClick(section.key)}
              >
                <div className={styles.sectionIconContainer}>
                  {section.icon}
                </div>
                <span className={styles.sectionLabel}>{section.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Duplicate and Delete Event Buttons */}
      <div className={styles.eventActions}>
        <button className={styles.duplicateButton}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
              fill="currentColor"
            />
          </svg>
          Duplicate Event
        </button>
        <button className={styles.deleteButton}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              fill="currentColor"
            />
          </svg>
          Delete Event
        </button>
      </div>
    </div>
  );
};

EventManageSidebar.propTypes = {
  currentSection: PropTypes.string.isRequired,
  sectionStatus: PropTypes.object.isRequired,
  navigateToSection: PropTypes.func.isRequired,
  navigateToEventEditPage: PropTypes.func.isRequired,
  eventId: PropTypes.string,
  isMobileSidebarOpen: PropTypes.bool.isRequired,
  toggleMobileSidebar: PropTypes.func.isRequired,
};

export default EventManageSidebar;