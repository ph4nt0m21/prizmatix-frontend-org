import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Cookies from 'js-cookie';
import {
  LoginAPI,
  OrganizationRegisterInitiateAPI,
  GetOrganizerProfileAPI,
} from '../services/allApis';
import { getUserData, setUserData } from '../utils/authUtil';
import { mapProfileResponseToUserData, notifyProfileUpdated } from '../utils/profileUtil';
import { REMEMBERED_LOGIN_EMAIL_KEY } from '../utils/authFeedback';

const AuthContext = createContext();

// The backend's JWT is valid for 10 hours (JwtService.createToken). Keep any persistent
// cookie to the same window: a cookie that outlives its token leaves the app looking
// signed in while every request 401s, which is exactly the state that got reported as
// "your API is down". Until refresh tokens land, "Remember me" therefore remembers the
// email and keeps the session for the token's full life — not for 7 days.
const TOKEN_LIFETIME_DAYS = 10 / 24;

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Single place that tears a session down, so an expired token and a deliberate logout
  // can never drift into clearing different things.
  const clearSession = useCallback(() => {
    Cookies.remove('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      return null;
    }

    const stored = getUserData();
    const role = (stored?.role || '').replace(/^ROLE_/, '');
    // Scanner users have no organizer profile — skip to avoid 403.
    if (role === 'SCANNER') {
      return stored;
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
      // A 401 is the server saying the token is dead — that is an answer, not a failure,
      // and it must end the session. Swallowing it here (returning the cached profile)
      // was half of why an expired token left the app looking signed in.
      //
      // Everything else — offline, timeout, 5xx — must NOT log anyone out: a transient
      // blip should leave them working against the cached profile.
      if (err?.response?.status === 401) {
        clearSession();
        return null;
      }
      console.error('Failed to refresh profile:', err);
      return getUserData();
    }
  }, [clearSession]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsInitializing(true);
      const token = Cookies.get('token');
      if (token) {
        const storedUserData = getUserData();
        if (storedUserData) {
          setCurrentUser(storedUserData);
        }
        // Optimistic: render the app from cache rather than blocking on the network.
        // The presence of a cookie is not proof the token inside it is still valid, so
        // this is only provisional — refreshProfile below is what actually validates it
        // against the server, and clears the session if it comes back 401.
        setIsAuthenticated(true);
        await refreshProfile();
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsInitializing(false);
    };

    checkAuthStatus();
  }, [refreshProfile]);

  const login = async (credentials, rememberMe = false) => {
    setError(null);

    const normalizedCredentials = {
      ...credentials,
      username: credentials.username?.trim().toLowerCase() ?? '',
    };

    try {
      const response = await LoginAPI(normalizedCredentials);

      // Without "remember me" this stays a session cookie (undefined = cleared when the
      // browser closes), which is the safer default on shared machines. With it, the
      // cookie lasts exactly as long as the token — not the 7 days it used to claim.
      const cookieOptions = rememberMe ? { expires: TOKEN_LIFETIME_DAYS } : undefined;
      Cookies.set('token', response.data.token, cookieOptions);

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_LOGIN_EMAIL_KEY, normalizedCredentials.username);
      } else {
        localStorage.removeItem(REMEMBERED_LOGIN_EMAIL_KEY);
      }

      const rawRole =
        response.data.roles && response.data.roles.length > 0 ? response.data.roles[0] : null;
      const role = rawRole ? String(rawRole).replace(/^ROLE_/, '') : null;

      const userData = {
        id: response.data.id || response.data.userId,
        organizationId: response.data.organizationId,
        organizationName: response.data.organizationName,
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        name: response.data.name || `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
        email: response.data.email || normalizedCredentials.username,
        role,
        assignedEventId: response.data.assignedEventId ?? null,
      };
      setUserData(userData);
      setCurrentUser(userData);
      setIsAuthenticated(true);

      if (role !== 'SCANNER') {
        await refreshProfile();
      }

      return { ...response.data, role, assignedEventId: userData.assignedEventId };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await OrganizationRegisterInitiateAPI(userData);

      const token = response.data.token || response.data.accessToken;
      if (token) {
        // Was 1 day against a 10-hour token — same mismatch as the login path.
        Cookies.set('token', token, { expires: TOKEN_LIFETIME_DAYS });
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
      throw err;
    }
  };

  const logout = () => {
    clearSession();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    isAuthenticated,
    isInitializing,
    isLoading: isInitializing,
    error,
    login,
    register,
    logout,
    clearError,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
