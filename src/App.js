import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/authContext';
import MainLayout from "./layout/mainLayout/mainLayout";
import "./App.css";
import HomePage from "./pages/homePage/homePage";
import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/multiStepRegisterPage";
import ProtectedRoute from "./security/protectedRoute";
import NotFoundPage from "./pages/notFound/notFoundPage";
import LoadingSpinner from "./components/common/loadingSpinner/loadingSpinner";
import CreateEventPage from "./pages/events/createEventPage";

// Main App component
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
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
        
        {/* Protected Routes within MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            
            {/* Event Creation Routes */}
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/create/:eventId" element={<CreateEventPage />} />
            <Route path="events/create/:eventId/:step" element={<CreateEventPage />} />
            
            {/* Add more protected routes as needed */}
          </Route>
          <Route 
          path="*" 
          element={isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" />} 
        />
        </Route>
        
        {/* Redirect and 404 handler */}
        
      </Routes>
    </div>
  );
}

// Wrapper App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;