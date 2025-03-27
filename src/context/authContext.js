import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { LoginAPI, RegisterAPI, ProfileAPI } from '../services/allApis';

// Create the auth context
const AuthContext = createContext();

// Helper hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if the user is authenticated based on token presence
   */
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      
      if (token) {
        // Token exists, try to fetch user profile
        try {
          const response = await LoginAPI(token);
          setCurrentUser(response.data);
          setIsAuthenticated(true);
          console.log('User profile:', response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Even if profile fetch fails, if token exists, consider authenticated
          setIsAuthenticated(true);
        }
      } else {
        // No token, not authenticated
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with username and password
   * @param {Object} credentials - User credentials
   * @returns {Promise} Promise resolving to login result
   */
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await LoginAPI(credentials);
      
      // Store token in cookie
      if (response.data && response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: 1, // 1 day
        });
      } else if (typeof response.data === 'string') {
        Cookies.set('token', response.data, { 
          expires: 1,
        });
      }
      
      // Set user and authentication state
      setCurrentUser(response.data.user || {});
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new organization
   * @param {Object} userData - Registration data
   * @returns {Promise} Promise resolving to registration result
   */
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use registration data as-is, without adding username from email
      const registrationData = {
        ...userData
      };
      
      console.log('Sending registration data:', registrationData);
      const response = await RegisterAPI(registrationData);
      console.log('Registration response:', response);
      
      // Store token in cookie if provided
      if (response.data && response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: 1, // 1 day
        });
      } else if (typeof response.data === 'string') {
        Cookies.set('token', response.data, { 
          expires: 1,
        });
      } else if (response.data) {
        // Check for nested token
        const token = response.data.accessToken || response.data.jwt || response.data.auth_token;
        if (token) {
          Cookies.set('token', token, {
            expires: 1,
          });
        }
      }
      
      // Ensure the user object contains necessary fields
      const user = response.data.user || {};
      if (!user.name) {
        user.name = `${userData.firstName} ${userData.lastName}`;
      }
      
      // Set user and authentication state
      setCurrentUser(user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    Cookies.remove('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Clear auth errors
   */
  const clearError = () => {
    setError(null);
  };

  // Auth context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;