import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../layout/header/header';
import Footer from '../../layout/footer/footer'; // Assuming Footer is used elsewhere
import SideNavBar from '../../layout/sideNavBar/sideNavbar';
import EventCreationSidebar from '../../pages/events/components/eventCreationSidebar'; // Import EventCreationSidebar
import styles from './mainLayout.module.scss';
import ErrorBoundary from '../../components/common/errorBoundary/errorBoundary';

/**
 * MainLayout component serves as the main layout wrapper for the application.
 * It now includes state and logic for a mobile-responsive sidebar,
 * unifying control for both general SideNavBar and EventCreationSidebar,
 * allowing both to be present on event creation routes when the mobile menu is open.
 *
 * @returns {JSX.Element} The MainLayout component
 */
const MainLayout = () => {
  const location = useLocation();
  // State to control the visibility of the mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Determine if the current page is a full-page layout (e.g., login, register)
  const isFullPageLayout = ['/login', '/register', '/error', '/forgot-password', '/reset-link-sent'].includes(location.pathname);

  // Check if we're in the event creation flow
  const isEventCreationRoute = location.pathname.includes('/events/create');

  /**
   * Toggles the mobile sidebar open/closed.
   */
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (isFullPageLayout) {
    return <Outlet />;
  }

  return (
    <div className={styles.outerContainer}>
      {/* Side Navigation Bar - always rendered, visibility controlled by CSS and isMobileSidebarOpen */}
      <SideNavBar
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      {/* Event Creation Sidebar - conditionally rendered for event creation route, visibility controlled by CSS and isMobileSidebarOpen */}
      {isEventCreationRoute && (
        <EventCreationSidebar
          currentStep={1} // Placeholder, actual step management is in CreateEventPage
          stepStatus={{}} // Placeholder, actual status management is in CreateEventPage
          navigateToStep={() => {}} // Placeholder
          isMobileSidebarOpen={isMobileSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar} // Pass toggle to allow closing from sidebar
        />
      )}

      {/* Mobile Overlay - appears when sidebar is open on small screens */}
      {isMobileSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileSidebar}></div>
      )}

      <div className={styles.mainContentWrapper}>
        {/* Header - always present, passes toggle function for hamburger menu */}
        <Header toggleMobileSidebar={toggleMobileSidebar} />

        <main className={`${styles.contentArea} ${isEventCreationRoute ? styles.fullHeight : ''}`}>
          <ErrorBoundary>
            <Outlet context={{ toggleMobileSidebar }} /> {/* Pass toggle function via context for nested routes */}
          </ErrorBoundary>
        </main>

        {/* Footer (commented out as per original, but can be re-enabled if needed) */}
        {/* {!isEventCreationRoute && <Footer />} */}
      </div>
    </div>
  );
};

export default MainLayout;