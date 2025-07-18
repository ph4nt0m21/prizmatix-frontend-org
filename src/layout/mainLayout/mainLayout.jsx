import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../layout/header/header';
import Footer from '../../layout/footer/footer'; // Assuming Footer is used elsewhere
import SideNavBar from '../../layout/sideNavBar/sideNavbar';
import styles from './mainLayout.module.scss';
import ErrorBoundary from '../../components/common/errorBoundary/errorBoundary';

/**
 * MainLayout component serves as the main layout wrapper for the application.
 * It now includes state and logic for a mobile-responsive sidebar.
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
      {/* Side Navigation Bar - now conditionally rendered and styled for mobile */}
      <SideNavBar
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      {/* Mobile Overlay - appears when sidebar is open on small screens */}
      {isMobileSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileSidebar}></div>
      )}

      <div className={styles.mainContentWrapper}>
        {/* Header - passes toggle function for hamburger menu */}
        {!isEventCreationRoute && (
          <Header toggleMobileSidebar={toggleMobileSidebar} />
        )}

        <main className={`${styles.contentArea} ${isEventCreationRoute ? styles.fullHeight : ''}`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Footer (commented out as per original, but can be re-enabled if needed) */}
        {/* {!isEventCreationRoute && <Footer />} */}
      </div>
    </div>
  );
};

export default MainLayout;
