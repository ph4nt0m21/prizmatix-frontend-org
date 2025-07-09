import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
// Correctly import OrganizationRegisterInitiateAPI instead of the non-existent RegisterAPI
import {
  LoginAPI,
  OrganizationRegisterInitiateAPI,
  ProfileAPI
} from '../services/allApis';

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

  // Check user's auth status on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const token = Cookies.get('token');
      if (token) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setCurrentUser(JSON.parse(storedUserData));
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  /**
   * Logs in the user and handles session persistence.
   * @param {object} credentials - The user's login credentials { username, password }.
   * @param {boolean} rememberMe - If true, sets a longer cookie expiration.
   */
  const login = async (credentials, rememberMe = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await LoginAPI(credentials);

      const expiryDays = rememberMe ? 7 : 1;
      Cookies.set('token', response.data.token, { expires: expiryDays });

      const userData = {
        id: response.data.id || response.data.userId,
        organizationId: response.data.organizationId,
        organizationName: response.data.organizationName,
        name: response.data.name || `${response.data.firstName} ${response.data.lastName}`,
        email: response.data.email || credentials.username,
        role: response.data.role,
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      setCurrentUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user/organization.
   * @param {object} userData - The data for the new user.
   */
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call the correct, existing API function
      const response = await OrganizationRegisterInitiateAPI(userData);

      const token = response.data.token || response.data.accessToken;
      if (token) {
        Cookies.set('token', token, { expires: 1 });
      }

      const user = response.data.user || {};
      if (!user.name) {
        user.name = `${userData.firstName} ${userData.lastName}`;
      }
      localStorage.setItem('userData', JSON.stringify(user));

      setCurrentUser(user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out the current user.
   */
  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Clears any existing auth errors.
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;