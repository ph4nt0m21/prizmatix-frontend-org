import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../layout/header/header';
import Footer from '../../layout/footer/footer'; // Assuming Footer is used elsewhere
import SideNavBar from '../../layout/sideNavBar/sideNavbar';
import styles from './mainLayout.module.scss';
import ErrorBoundary from '../../components/common/errorBoundary/errorBoundary';

/**
 * MainLayout component serves as the main layout wrapper for the application.
 * It now controls only the main SideNavBar's mobile visibility.
 * Other page-specific sidebars manage their own state.
 *
 * @returns {JSX.Element} The MainLayout component
 */
const MainLayout = () => {
  const location = useLocation();
  // State to control the visibility of the main SideNavBar on mobile
  const [isSideNavBarOpen, setIsSideNavBarOpen] = useState(false); // Renamed for clarity

  // Determine if the current page is a full-page layout (e.g., login, register)
  const isFullPageLayout = ['/login', '/register', '/error', '/forgot-password', '/reset-link-sent'].includes(location.pathname);

  // This variable is still passed via context for other conditional rendering in child components
  const isEventCreationOrManageRoute = location.pathname.includes('/events/create') || location.pathname.includes('/events/manage');

  /**
   * Toggles the main SideNavBar open/closed.
   */
  const toggleSideNavBar = () => { // Renamed for clarity
    setIsSideNavBarOpen(!isSideNavBarOpen);
  };

  if (isFullPageLayout) {
    return <Outlet />;
  }

  return (
    <div className={styles.outerContainer}>
      {/* Side Navigation Bar - always rendered. Its 'open' state is now *only* tied to isSideNavBarOpen. */}
      {/* This ensures it opens ONLY when the main header's hamburger is clicked. */}
      <SideNavBar
        isMobileSidebarOpen={isSideNavBarOpen} // Pass local state for SideNavBar
        toggleMobileSidebar={toggleSideNavBar} // Pass local toggle for SideNavBar
      />

      {/* Mobile Overlay - appears when the main SideNavBar is open on small screens */}
      {isSideNavBarOpen && (
        <div className={`${styles.mobileOverlay} ${isSideNavBarOpen ? styles.active : ''}`} onClick={toggleSideNavBar}></div>
      )}

      <div className={styles.mainContentWrapper}>
        {/* Header - always present, passes toggle function for main SideNavBar */}
        <Header toggleMobileSidebar={toggleSideNavBar} /> {/* Header always toggles main SideNavBar */}

        <main className={`${styles.contentArea} ${isEventCreationOrManageRoute ? styles.fullHeight : ''}`}>
          <ErrorBoundary>
            {/* Pass global toggle and state via context. Child components will decide which sidebar to open. */}
            <Outlet context={{ toggleGlobalSideNavBar: toggleSideNavBar, isGlobalSideNavBarOpen: isSideNavBarOpen, isEventCreationOrManageRoute }} />
          </ErrorBoundary>
        </main>

        {/* Footer (commented out as per original, but can be re-enabled if needed) */}
        {/* {!isEventCreationOrManageRoute && <Footer />} */}
      </div>
    </div>
  );
};

export default MainLayout;