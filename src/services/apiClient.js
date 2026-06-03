import axios from "axios";
import Cookies from "js-cookie";

const BASEURL = process.env.REACT_APP_API_URL;

console.log("API Base URL:", BASEURL); // Add this for debugging

const apiClient = axios.create({
  baseURL: BASEURL,
});

/** Public auth routes must not send a stale JWT or trigger a forced logout redirect. */
const isPublicAuthRequest = (url = "") =>
  url.includes("/login") ||
  url.includes("/api/organizations/register") ||
  url.includes("/api/auth/forgot-password") ||
  url.includes("/forgot-password") ||
  url.includes("/reset-password");

// Request Interceptor: Attach Token to Requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    const isPublic = isPublicAuthRequest(config.url || "");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Adding token to request:", config.url);
    } else if (!isPublic) {
      console.warn("No token found for request:", config.url);
    }
    
    config.headers["Accept"] = "application/json";
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
      // Log request body for debugging
      console.log(`Request to ${config.url}:`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized Errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    const skipForcedLogout =
      url.includes("/scanner/verify") || isPublicAuthRequest(url);

    if ((status === 401 || status === 403) && !skipForcedLogout) {
      Cookies.remove("token");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;