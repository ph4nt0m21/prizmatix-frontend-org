import apiClient from "./apiClient";

// =============== AUTH APIs ===============

// Step 1: Initiate registration with email
export const OrganizationRegisterInitiateAPI = async (data) => {
  return await apiClient.post("/api/organizations/register/initiate", data);
};

// Step 2: Resend OTP if needed
export const OrganizationResendOtpAPI = async (data) => {
  return await apiClient.post("/api/organizations/register/resend-otp", data);
};

// Step 3: Verify OTP
export const OrganizationVerifyOtpAPI = async (data) => {
  return await apiClient.post("/api/organizations/register/verify-otp", data);
};

// Final Step: Complete organization registration
export const OrganizationRegisterAPIComplete = async (data) => {
  return await apiClient.post("/api/organizations/register/complete", data);
};

// API for login
export const LoginAPI = async (data) => {
  return await apiClient.post("/login", data);
};

// API for forgot password
export const ForgotPasswordAPI = async (data) => {
  return await apiClient.post("/forgot-password", data);
};

// API for reset password
export const ResetPasswordAPI = async (data) => {
  return await apiClient.post("/reset-password", data);
};

// Profile API
export const ProfileAPI = async () => {
  return await apiClient.get("/user/profile");
};

// =============== EVENT APIs ===============

// Create a new event with basic info (Step 1)
export const CreateEventAPI = async (data) => {
  return await apiClient.post("/api/events", data);
};

// Get event by ID
export const GetEventAPI = async (eventId) => {
  return await apiClient.get(`/api/events/${eventId}`);
};

// Update event by ID
export const UpdateEventAPI = async (eventId, data) => {
  return await apiClient.put(`/api/events/${eventId}`, data);
};

// Get all events with pagination
export const GetAllEventsAPI = async (params) => {
  return await apiClient.get("/api/events", { params });
};

// Delete an event
export const DeleteEventAPI = async (eventId, userId) => {
  return await apiClient.delete(`/api/events/${eventId}`, {
    params: { userId }
  });
};

// Update event status
export const UpdateEventStatusAPI = async (eventId, statusData) => {
  return await apiClient.patch(`/api/events/${eventId}/status`, statusData);
};

// =============== EVENT CREATION STEPS APIs ===============

// Step 2: Update event location
export const UpdateEventLocationAPI = async (eventId, locationData) => {
  return await apiClient.put(`/api/events/${eventId}/location`, locationData);
};

// Step 3: Update event date and time
export const UpdateEventDateTimeAPI = async (eventId, dateTimeData) => {
  return await apiClient.put(`/api/events/${eventId}/date-time`, dateTimeData);
};

// Step 4: Update event description
export const UpdateEventDescriptionAPI = async (eventId, descriptionData) => {
  return await apiClient.put(`/api/events/${eventId}/description`, descriptionData);
};

// Step 5: Upload event banner image
export const UploadEventBannerAPI = async (eventId, bannerData) => {
  return await apiClient.put(`/api/events/${eventId}/banner-image`, bannerData);
};

// Step 6: Update event tickets
export const UpdateEventTicketsAPI = async (eventId, ticketsData) => {
  return await apiClient.post(`/api/events/${eventId}/tickets`, ticketsData);
};

// Step 7: Update event discount codes
export const UpdateEventDiscountCodesAPI = async (eventId, discountCodesData) => {
  return await apiClient.post(`/api/events/${eventId}/discount-codes`, discountCodesData);
};

// Step 8: Publish event
export const PublishEventAPI = async (eventId, publishData) => {
  return await apiClient.post(`/api/events/${eventId}/publish`, publishData);
};

// =============== EVENT DATA FETCHING APIs ===============

// Get event location
export const GetEventLocationAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/location`);
};

// Get event date and time
export const GetEventDateTimeAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/date-time`);
};

// Get event description
export const GetEventDescriptionAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/description`);
};

// Get event banner image
export const GetEventBannerAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/banner-image`);
};

// Get event tickets
export const GetEventTicketsAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/tickets`);
};

// Get event discount codes
export const GetEventDiscountCodesAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/discount-codes`);
};

// Get event creation status
export const GetEventCreationStatusAPI = async (eventId) => {
  return await apiClient.get(`/events/${eventId}/status`);
};