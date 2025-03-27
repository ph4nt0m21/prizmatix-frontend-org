import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../layout/header/header';
import Footer from '../../layout/footer/footer';
import SideNavBar from '../../layout/sideNavBar/sideNavbar';
import styles from './mainLayout.module.scss';
import ErrorBoundary from '../../components/common/errorBoundary/errorBoundary';

/**
 * MainLayout component serves as the main layout wrapper for the application
 * It includes SideNavBar, Header, main content area (via Outlet), and Footer
 * Uses ErrorBoundary to catch and handle errors in child components
 */
const MainLayout = () => {
  const location = useLocation();
  
  // Determine if the current page is a full-page layout
  // For example, login, registration, or error pages might not need the standard layout
  const isFullPageLayout = ['/login', '/register', '/error'].includes(location.pathname);
  
  if (isFullPageLayout) {
    return <Outlet />;
  }
  
  return (
    <div className={styles.layoutContainer}>
      <SideNavBar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.contentArea}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;