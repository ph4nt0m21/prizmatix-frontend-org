import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import LoadingSpinner from "../components/common/loadingSpinner/loadingSpinner";

/**
 * ProtectedRoute component checks if the user is authenticated
 * Redirects to login page if not authenticated
 * 
 * @returns {JSX.Element} The Outlet component or a redirect
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // If authentication is still being checked, show a loading spinner
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner fullPage size="large" />
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Pass the current location to the login page so we can redirect back after login
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;