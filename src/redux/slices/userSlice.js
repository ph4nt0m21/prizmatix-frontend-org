import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LoginAPI, RegisterAPI, ProfileAPI } from '../../services/allApis';
import Cookies from 'js-cookie';

// Helper functions
const isAuthenticated = () => {
  return !!Cookies.get('token');
};

/**
 * Async thunk for user login
 */
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await LoginAPI(credentials);
      
      // Store token in cookie
      if (response.data && response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: Number(process.env.PUBLIC_AUTH_COOKIE_EXPIRY || 1),
        });
      } else if (typeof response.data === 'string') {
        // Handle case where token is returned directly
        Cookies.set('token', response.data, { 
          expires: Number(process.env.PUBLIC_AUTH_COOKIE_EXPIRY || 1),
        });
      }
      
      // Return user data for store
      return response.data.user || {};
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

/**
 * Async thunk for organization registration
 */
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Format the data exactly as required by the API
      const registrationData = {
        name: userData.name,
        description: userData.description || '',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        region: userData.region,
        state: userData.state,
        mobileNumber: userData.mobileNumber,
        password: userData.password
      };
      
      console.log('Sending registration data:', registrationData);
      const response = await RegisterAPI(registrationData);
      console.log('Registration response:', response);
      
      // Store token in cookie if provided
      if (response.data && response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: Number(process.env.PUBLIC_AUTH_COOKIE_EXPIRY || 1),
        });
        console.log('Token set in cookie:', response.data.token);
      } else if (response.data && typeof response.data === 'string') {
        // Handle case where token is returned directly
        Cookies.set('token', response.data, { 
          expires: Number(process.env.PUBLIC_AUTH_COOKIE_EXPIRY || 1),
        });
        console.log('String token set in cookie:', response.data);
      } else if (response.data) {
        // If response.data exists but token is not directly accessible
        // This handles cases where the token might be nested differently
        const token = response.data.accessToken || response.data.jwt || response.data.auth_token;
        if (token) {
          Cookies.set('token', token, {
            expires: Number(process.env.PUBLIC_AUTH_COOKIE_EXPIRY || 1),
          });
          console.log('Nested token set in cookie:', token);
        } else {
          console.warn('No token found in response data:', response.data);
        }
      }
      
      // Return user data for store
      const user = response.data.user || {};
      
      // Ensure the user object contains necessary fields for the UI
      if (!user.name) {
        user.name = `${userData.firstName} ${userData.lastName}`;
      }
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide a more detailed error message if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Registration failed. Please try again.';
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk for getting user profile
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Check if token exists
      if (!isAuthenticated()) {
        return rejectWithValue('Not authenticated');
      }
      
      const response = await ProfileAPI();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

/**
 * Initial state for user slice
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * User slice for Redux
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Logout user
    logout: (state) => {
      // Remove token cookie
      Cookies.remove('token');
      state.user = null;
      state.isAuthenticated = false;
    },
    
    // Clear error
    clearUserError: (state) => {
      state.error = null;
    },
    
    // Check auth status from cookie
    checkAuthStatus: (state) => {
      state.isAuthenticated = isAuthenticated();
      // This is critical - if token exists but state says not authenticated
      if (isAuthenticated() && !state.isAuthenticated) {
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login reducers
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register reducers
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true; // Explicitly set to true
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Fetch profile reducers
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        // If we have a token, keep authenticated state true despite profile fetch failure
        state.isAuthenticated = isAuthenticated();
        if (!state.isAuthenticated) {
          state.user = null;
        }
      });
  },
});

export const { logout, clearUserError, checkAuthStatus } = userSlice.actions;

export default userSlice.reducer;