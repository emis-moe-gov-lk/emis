import api from "./axios";

/**
 * Register a new DEO Officer (Zonal Administrator)
 * @param {Object} data - The DEO officer registration form data
 * @returns {Promise} - Axios response payload
 */
export const registerDeoOfficer = async (data) => {
  const response = await api.post("/deo-officers", data);
  return response.data;
};

/**
 * Register a new Education Administrator (Zonal Director / Deputy Director)
 * @param {Object} data - The DOS admin registration form data
 * @returns {Promise} - Axios response payload
 */
export const registerDosAdmin = async (data) => {
  const response = await api.post("/dos-admins", data);
  return response.data;
};

/**
 * Get DEO Officer form dropdown data
 * @returns {Promise} - Form data with available options
 */
export const getDeoOfficerFormData = async () => {
  const response = await api.get("/deo-officers/form-data");
  return response.data;
};

/**
 * Get all DEO Officers
 * @returns {Promise} - List of DEO officers
 */
export const getDeoOfficers = async () => {
  const response = await api.get("/deo-officers");
  return response.data;
};

/**
 * Get all DOS Admins (Zonal Directors / Deputy Directors)
 * @param {Object} params - Optional query params (per_page, nic)
 * @returns {Promise} - Paginated list of DOS admins
 */
export const getDosAdmins = async (params = {}) => {
  const response = await api.get("/dos-admins", { params });
  return response.data;
};

/**
 * Get single DEO Officer
 * @param {string|number} id - The DEO officer's people_id
 * @returns {Promise} - DEO officer data
 */
export const getDeoOfficer = async (id) => {
  const response = await api.get(`/deo-officers/${id}`);
  return response.data;
};

/**
 * Get single DOS Admin profile
 * @param {string|number} id - The DOS admin's people_id
 * @returns {Promise} - DOS admin profile data
 */
export const getDosAdmin = async (id) => {
  const response = await api.get(`/dos-admins/${id}`);
  return response.data;
};

