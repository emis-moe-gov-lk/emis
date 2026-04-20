import axios from "axios";
import { AsgardeoSPAClient } from "@asgardeo/auth-react";

// Backend API base URL (from Vite env)
const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Bearer token from Asgardeo SSO
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the Asgardeo auth client instance
      const authClient = AsgardeoSPAClient.getInstance();

      // Get the access token from Asgardeo
      const accessToken = await authClient.getAccessToken();

      if (accessToken) {
        console.log("Access token:", accessToken);
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error fetching access token from Asgardeo:", error);
      // Continue with the request even if token fetch fails
      // This allows unauthenticated requests to still work
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors (optional)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized request - token may be expired");
      // Optionally trigger re-authentication here
    }
    return Promise.reject(error);
  },
);

export default api;
