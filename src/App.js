import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { LoginAPI } from "./services/allApis";
import MainLayout from "./layout/mainLayout/mainLayout";
import "./App.css";
import HomePage from "./pages/homePage/homePage";
import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/multiStepRegisterPage";
import ForgotPasswordPage from "./pages/auth/forgotPasswordPage";
import ResetLinkSentPage from "./pages/auth/resetLinkSentPage";
import ResetPasswordPage from "./pages/auth/resetPasswordPage";
import ProtectedRoute from "./security/protectedRoute";
import NotFoundPage from "./pages/notFound/notFoundPage";
import LoadingSpinner from "./components/common/loadingSpinner/loadingSpinner";
import EventsPage from "./pages/events/eventsPage";
import CreateEventPage from "./pages/events/createEventPage";
import EventManagePage from './pages/events/manageEventPage'; 
import EditEventPage from './pages/events/editEventPage';
import { setupEventDataCleanup, checkAndCleanupEventData } from './utils/eventUtil';

/**
 * App component defines the main routing structure and handles authentication
 * @returns {JSX.Element} The App component
 */
function App() {
  // Authentication loading state only
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated on initial load - just to handle loading state
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get('token');
        
        if (token) {
          try {
            await LoginAPI(token);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Even if profile fetch fails, if token exists, consider authenticated
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  useEffect(() => {
  // Check for stale event data on app startup
  checkAndCleanupEventData(120); // Clear stale event data after 2 hours
  
  // Setup cleanup for when user closes tab or window
  setupEventDataCleanup();
}, []);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner fullPage={true} size="large" />
      </div>
    );
  }
  
  return (
    <div>
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
        
        {/* Protected Routes using ProtectedRoute component */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="events" element={<EventsPage />} />
            
            {/* Manage Event Routes*/}
            <Route path="events/manage/:eventId/:section" element={<EventManagePage />} />
            <Route path="events/edit" element={<EditEventPage/>} />

            {/* Event Creation Routes */}
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/create/:eventId" element={<CreateEventPage />} />
            <Route path="events/create/:eventId/:step" element={<CreateEventPage />} />
            
            {/* Add more protected routes as needed */}
          </Route>
        </Route>
        
        {/* 404 handler */}
        <Route 
          path="*" 
          element={<NotFoundPage />} 
        />
      </Routes>
    </div>
  );
}

export default App;