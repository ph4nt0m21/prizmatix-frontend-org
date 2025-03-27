import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['events/fetchEvents/fulfilled', 'user/login/fulfilled', 'user/register/fulfilled'],
        ignoredPaths: ['events.currentEvent.createdAt', 'events.currentEvent.updatedAt', 'user.user.createdAt'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;