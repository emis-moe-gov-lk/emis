import api from "./axios";

/**
 * Register a new teacher or update existing profile
 * @param {Object} data - The teacher registration form data
 * @returns {Promise} - Axios promise
 */
export const registerTeacher = async (data) => {
  const response = await api.post("/teacher-create", data);
  return response.data;
};

/**
 * Check whether teacher contact fields already exist
 * @param {Object} data - Payload with optional email and phone
 * @returns {Promise} - Axios response payload
 */
export const checkTeacherContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

/**
 * Print teacher ID card as PDF
 * @param {string|number} id - The teacher's people_id
 * @returns {Promise} - Axios promise with blob response
 */
export const printTeacherId = async (id) => {
  const response = await api.get(`/pdf/id/${id}`, { responseType: "blob" });
  return response.data;
};

/**
 * Download the full teacher profile document as PDF
 * @param {string|number} id - The teacher's people_id
 * @returns {Promise} - Axios promise with blob response
 */
export const downloadTeacherProfileDocument = async (id) => {
  const response = await api.get(`/pdf/teacher/${id}`, {
    responseType: "arraybuffer",
  });
  return response;
};

/**
 * Promote a teacher profile to principle/principal workflow
 * @param {string|number} id - The teacher's people_id
 * @param {Object} payload - Optional payload fields like reason
 * @returns {Promise} - Axios response payload
 */
export const promoteTeacher = async (id, payload = {}) => {
  const response = await api.patch(`/teachers/${id}/promote`, payload);
  return response.data;
};
