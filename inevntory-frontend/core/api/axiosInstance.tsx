import axios from "axios";
import Cookies from "js-cookie";

import { adminToken, currentAdmin, currentUser, isSuperAdmin } from "./localStorageKeys"

export const baseUrlExport = "https://backend.rohanchatterjee866.workers.dev/api/v1/"
export const baseUrlExportNgRok = "https://2798-106-222-236-78.ngrok-free.app"
export const localBackend = "http://localhost:5000/api/v1/web/"

const instance = axios.create({
  baseURL: localBackend,
  headers: {
    "Content-Type": "application/json",
   //"ngrok-skip-browser-warning": "123",
  },
});

// Request Interceptor (unchanged)
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(currentUser); 

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
   // Check if the request is multipart/form-data (file upload request)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Axios will set the correct Content-Type automatically for multipart requests
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (modified)
instance.interceptors.response.use(
  (response) => {
    return response; // Return successful responses
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      // Remove all cookies if status code is 403 (Forbidden)
      const location = Cookies.get(currentUser) ? "/dashboard" : "/signin";
      Cookies.remove(currentUser);
      Cookies.remove(adminToken);
      Cookies.remove(currentAdmin);
      Cookies.remove(isSuperAdmin);
      window.location.href = location;
    }
    return Promise.reject(error);
  }
);

export default instance;
