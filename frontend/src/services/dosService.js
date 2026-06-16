/**
 * DOS Service - Development Officer of Schools API Service
 * 
 * Provides a custom hook for accessing DOS (Development Officer) related APIs.
 * Handles authentication token management and API calls for DOS operations.
 * 
 * @module dosService
 */

import { useAuthContext } from "@asgardeo/auth-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * useDosService - Custom hook for DOS API operations
 * 
 * Manages authentication tokens and provides methods for DOS data operations.
 * All API calls automatically include Bearer token authentication.
 * 
 * @hook
 * @returns {Object} Object containing DOS API methods
 * @returns {Function} returns.getAllDos - Fetches all DOS officers
 * @returns {Function} returns.getDosById - Fetches single DOS officer by ID
 * @returns {Function} returns.searchDos - Searches DOS officers by criteria
 * @returns {Function} returns.checkDosContact - Validates contact uniqueness
 * 
 * @throws {Error} If access token is not available
 * 
 * @example
 * const { getAllDos, searchDos } = useDosService();
 * const dosOfficers = await getAllDos();
 */
export const useDosService = () => {
  const { getAccessToken } = useAuthContext();

  /**
   * Helper function to build authorization headers
   * Ensures consistent header format across all requests
   * 
   * @async
   * @returns {Promise<Object>} Headers object with Authorization
   * @throws {Error} If access token is unavailable
   */
  const getAuthHeaders = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("Access token not available");
    
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  /**
   * Fetches all DOS officers from the system
   * Supports pagination and filtering via query parameters
   * 
   * @async
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.per_page - Results per page (default: 20)
   * @param {string} options.search - Search term (NIC, name, etc.)
   * @returns {Promise<Object>} API response with DOS officers data
   * @returns {Promise<Array>} returns.data - Array of DOS officer objects
   * @throws {Error} If fetch fails
   * 
   * @example
   * const result = await getAllDos({ page: 1, per_page: 20 });
   * console.log(result.data);
   */
  const getAllDos = async (options = {}) => {
    const headers = await getAuthHeaders();
    
    // Build query string from options
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page);
    if (options.per_page) params.append("per_page", options.per_page);
    if (options.search) params.append("search", options.search);
    if (options.scope) params.append("scope", options.scope);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_BASE_URL}/deo-officers?${queryString}`
      : `${API_BASE_URL}/deo-officers`;

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch DOS officers: ${res.statusText}`);
    }

    return res.json();
  };

  /**
   * Fetches a single DOS officer by ID
   * Returns complete profile including appointments and details
   * 
   * @async
   * @param {string} id - DOS officer ID or people_id
   * @returns {Promise<Object>} Single DOS officer object with all details
   * @throws {Error} If DOS officer not found or fetch fails
   * 
   * @example
   * const officer = await getDosById('PEO001');
   */
  const getDosById = async (id) => {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/deo-officers/${id}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch DOS officer: ${res.statusText}`);
    }

    return res.json();
  };

  /**
   * Searches DOS officers by multiple criteria
   * Supports NIC, name, email, and status filtering
   * 
   * @async
   * @param {Object} criteria - Search criteria
   * @param {string} criteria.nic - Search by NIC number
   * @param {string} criteria.fullName - Search by name
   * @param {string} criteria.email - Search by email
   * @param {string} criteria.status - Filter by status (active, inactive, etc.)
   * @returns {Promise<Object>} Filtered DOS officers matching criteria
   * @throws {Error} If search fails
   * 
   * @example
   * const results = await searchDos({ nic: '900000000V', status: 'active' });
   */
  const searchDos = async (criteria) => {
    const headers = await getAuthHeaders();
    
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const res = await fetch(`${API_BASE_URL}/deo-officers?${params.toString()}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.statusText}`);
    }

    return res.json();
  };

  /**
   * Checks if contact information (email/phone) is unique
   * Used during registration to prevent duplicate contacts
   * 
   * @async
   * @param {Object} data - Contact data to validate
   * @param {string} data.email - Email to check
   * @param {string} data.phone - Phone number to check
   * @param {string} data.exclude_id - DOS ID to exclude from check (for updates)
   * @returns {Promise<Object>} Validation result with availability status
   * @throws {Error} If validation fails
   * 
   * @example
   * const isValid = await checkDosContact({ email: 'dos@example.com' });
   */
  const checkDosContact = async (data) => {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/deo-officers/check-contact`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Contact validation failed: ${res.statusText}`);
    }

    return res.json();
  };

  return {
    getAllDos,
    getDosById,
    searchDos,
    checkDosContact,
  };
};

