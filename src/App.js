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
import EmailCampaignsPage from './pages/emailCampaigns/emailCampaignsPage';
import ReportsPage from './pages/reports/reportsPage';
import ScannerPage from './pages/scanner/scannerPage';

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
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    checkAndCleanupEventData(120); 
    setupEventDataCleanup();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner fullPage={true} size="large" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />}
        />
        <Route
          path="/reset-link-sent"
          element={isAuthenticated ? <Navigate to="/" /> : <ResetLinkSentPage />}
        />
        <Route
          path="/reset-password"
          element={isAuthenticated ? <Navigate to="/" /> : <ResetPasswordPage />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
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
            <Route path="campaigns" element={<EmailCampaignsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:eventId" element={<ReportsPage />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="scanner/:eventId" element={<ScannerPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* ✅ ToastContainer is outside Routes */}
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
    </>
  );
};


/**
 * App component now simply wraps the main content with the AuthProvider.
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;