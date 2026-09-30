import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/authContext'; // Import AuthProvider and useAuth
import MainLayout from "./layout/mainLayout/mainLayout";
import "./App.css";

// Import all your pages
import HomePage from "./pages/homePage/homePage";
import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/multiStepRegisterPage";
import ForgotPasswordPage from "./pages/auth/forgotPasswordPage";
import ResetLinkSentPage from "./pages/auth/resetLinkSentPage";
import ResetPasswordPage from "./pages/auth/resetPasswordPage";
import EventsPage from "./pages/events/eventsPage";
import CreateEventPage from "./pages/events/createEventPage";
import EventManagePage from './pages/events/manageEventPage';
import EventEditPage from './pages/events/eventEditPage';
import TicketEditPage from './pages/events/ticketEditPage';
import NotFoundPage from "./pages/notFound/notFoundPage";
// NEW: Import EmailCampaignsPage
import EmailCampaignsListPage from './pages/emailCampaigns/emailCampaignsListPage';
import EmailCampaignsPage from './pages/emailCampaigns/emailCampaignsPage';
import ReportsPage from './pages/reports/reportsPage';
import ScannerPage from './pages/scanner/scannerPage';
import PayoutAccountPage from './pages/payoutAccount/payoutAccountPage';
// import UnauthorizedPage from './pages/unauthorized/unauthorizedPage';

// Import utilities and components
import ProtectedRoute from "./security/protectedRoute";
import LoadingSpinner from "./components/common/loadingSpinner/loadingSpinner";
import { setupEventDataCleanup, checkAndCleanupEventData } from './utils/eventUtil';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * AppContent defines the routing structure and uses the auth context.
 * It's a separate component to ensure it's rendered inside AuthProvider.
 */
const AppContent = () => {
  const { isAuthenticated, isInitializing, currentUser } = useAuth();
  const role = (currentUser?.role || '').replace(/^ROLE_/, '');
  const authenticatedHome = role === 'SCANNER' ? '/scanner' : '/';

  useEffect(() => {
    checkAndCleanupEventData(120);
    setupEventDataCleanup();
  }, []);

  if (isInitializing) {
    return (
      <div className="loading-container">
        <LoadingSpinner fullPage={true} size="large" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* ======================================== */}
        {/* ========= 1. PUBLIC ROUTES ========= */}
        {/* ======================================== */}
        {/* These routes are accessible to everyone. */}
        {/* If the user is already logged in, redirect them away from these pages. */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={authenticatedHome} /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={authenticatedHome} /> : <RegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to={authenticatedHome} /> : <ForgotPasswordPage />}
        />
        <Route
          path="/reset-link-sent"
          element={isAuthenticated ? <Navigate to={authenticatedHome} /> : <ResetLinkSentPage />}
        />
        <Route
          path="/reset-password"
          element={isAuthenticated ? <Navigate to={authenticatedHome} /> : <ResetPasswordPage />}
        />
        {/* ... other public auth routes ... */}

        {/* ======================================== */}
        {/* ======== 2. PROTECTED ROUTES ========= */}
        {/* ======================================== */}
        {/* This single ProtectedRoute acts as a gatekeeper. */}
        {/* If the user is not authenticated, it will redirect them to "/login". */}
        <Route element={<ProtectedRoute />}>

          {/* Routes for ORGANIZER and SUPER_ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['ORGANIZER', 'SUPER_ADMIN', 'ADMINISTRATOR']} />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/manage/:eventId/:section" element={<EventManagePage />} />
              <Route path="events/edit-page/:eventId/:step" element={<EventEditPage />} />
              <Route path="events/edit-page/:eventId" element={<EventEditPage />} />
              <Route path="events/edit-page" element={<EventEditPage />} />
              <Route path="events/tickets/:eventId" element={<TicketEditPage />} />
              <Route path="events/tickets" element={<TicketEditPage />} />
              <Route path="events/create" element={<CreateEventPage />} />
              <Route path="events/create/:eventId" element={<CreateEventPage />} />
              <Route path="events/create/:eventId/:step" element={<CreateEventPage />} />
              <Route path="campaigns" element={<EmailCampaignsListPage />} />
              <Route path="campaigns/new" element={<EmailCampaignsPage />} />
              <Route path="campaigns/:campaignId:" element={<EmailCampaignsPage />} />
              <Route path="campaigns/:campaignId/edit" element={<EmailCampaignsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:eventId" element={<ReportsPage />} />
              <Route path="payout-account" element={<PayoutAccountPage />} />
            </Route>
          </Route>

          {/* Routes for SCANNER (and ORGANIZER) */}
          <Route element={<ProtectedRoute allowedRoles={['SCANNER', 'ORGANIZER']} />}>
            <Route path="/" element={<MainLayout />}>
              <Route path="scanner" element={<ScannerPage />} />
            </Route>
          </Route>


        </Route> {/* End of main ProtectedRoute wrapper */}


        {/* ======================================== */}
        {/* ===== 3. OTHER PUBLIC ROUTES ======= */}
        {/* ======================================== */}
        {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}

export default App;