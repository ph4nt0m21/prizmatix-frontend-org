import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: true,
  sidebarCollapsed: false,
  notifications: [],
  activeModal: null,
  isLoading: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle dark/light mode
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    
    // Toggle sidebar collapsed state
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // Add a notification
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    
    // Remove a notification
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    
    // Set active modal
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    
    // Clear active modal
    clearActiveModal: (state) => {
      state.activeModal = null;
    },
    
    // Set loading state for a specific component/action
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.isLoading[key] = isLoading;
    },
  },
});

export const {
  toggleDarkMode,
  toggleSidebar,
  addNotification,
  removeNotification,
  setActiveModal,
  clearActiveModal,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;