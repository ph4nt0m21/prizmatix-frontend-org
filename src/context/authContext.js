import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Cookies from 'js-cookie';
import {
  LoginAPI,
  OrganizationRegisterInitiateAPI,
  GetOrganizerProfileAPI,
} from '../services/allApis';
import { getUserData, setUserData } from '../utils/authUtil';
import { mapProfileResponseToUserData, notifyProfileUpdated } from '../utils/profileUtil';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      return null;
    }

    try {
      const response = await GetOrganizerProfileAPI();
      const profile = response?.data?.data;
      if (!profile) {
        return getUserData();
      }

      const mergedUser = mapProfileResponseToUserData(profile, getUserData() || {});
      setUserData(mergedUser);
      setCurrentUser(mergedUser);
      notifyProfileUpdated();
      return mergedUser;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return getUserData();
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const token = Cookies.get('token');
      if (token) {
        const storedUserData = getUserData();
        if (storedUserData) {
          setCurrentUser(storedUserData);
        }
        setIsAuthenticated(true);
        await refreshProfile();
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [refreshProfile]);

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
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        name: response.data.name || `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
        email: response.data.email || credentials.username,
        role: response.data.roles && response.data.roles.length > 0 ? response.data.roles[0] : null,
      };
      setUserData(userData);
      setCurrentUser(userData);
      setIsAuthenticated(true);

      await refreshProfile();

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

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await OrganizationRegisterInitiateAPI(userData);

      const token = response.data.token || response.data.accessToken;
      if (token) {
        Cookies.set('token', token, { expires: 1 });
      }

      const user = response.data.user || {};
      if (!user.name) {
        user.name = `${userData.firstName} ${userData.lastName}`;
      }
      setUserData(user);
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

  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

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
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
