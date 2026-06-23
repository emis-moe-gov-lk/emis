import api from "./axios";

/**
 * Register a new School DEO
 * @param {Object} data - The School DEO registration form data
 * @returns {Promise} - Axios promise
 */
export const registerSchoolDeo = async (data) => {
  const response = await api.post("/schooldeo-create", data);
  return response.data;
};

/**
 * Check if email or phone number already exists
 * @param {Object} data - { email, phone }
 * @returns {Promise} - Axios promise
 */
export const checkSchoolDeoContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

/**
 * Get School DEO list
 * @param {Object} params - query params
 * @returns {Promise} - Axios promise
 */
export const getSchoolDeoList = async (params) => {
  const response = await api.get("/schooldeo-list", { params });
  return response.data;
};

/**
 * Get single School DEO profile
 * @param {string} peopleId - The people_id of the DEO
 * @returns {Promise} - Axios promise
 */
export const getSchoolDeoProfile = async (peopleId) => {
  const response = await api.get(`/schooldeo/${peopleId}`);
  return response.data;
};
