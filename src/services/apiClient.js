import axios from "axios";
import Cookies from "js-cookie";

const BASEURL = process.env.REACT_APP_API_URL || "http://localhost:8080/";

console.log("API Base URL:", BASEURL); // Add this for debugging

const apiClient = axios.create({
  baseURL: BASEURL,
});

// Request Interceptor: Attach Token to Requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Accept"] = "application/json";
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      Cookies.remove("token"); 
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;