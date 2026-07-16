import axios from "axios";
import { AsgardeoSPAClient } from "@asgardeo/auth-react";
import { getEnv } from "../utils/env";

// Backend API base URL (from Vite env)
const API_URL =
  getEnv("VITE_API_BASE_URL") ?? "http://127.0.0.1:8000/api";

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

let isRedirectingToLogout = false;

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isRedirectingToLogout) {
      console.error("Unauthorized — token expired. Redirecting to logout.");
      isRedirectingToLogout = true;
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/logout";
    }
    return Promise.reject(error);
  },
);

export default api;
