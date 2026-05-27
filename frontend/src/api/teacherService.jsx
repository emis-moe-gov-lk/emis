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

/**
 * Save teacher education qualification
 * @param {string|number} peopleId - The teacher's people_id
 * @param {Object} qualificationData - Qualification details (qualification, institution_university, effective_date, grade_result, additional_details)
 * @returns {Promise} - Axios response payload
 */
export const saveEducationQualification = async (peopleId, qualificationData) => {
  const response = await api.post(
    `/teachers/${peopleId}/education-qualifications`,
    qualificationData,
  );
  return response.data;
};

/**
 * Get list of available education qualifications
 * @returns {Promise} - Axios response payload with list of qualifications
 */
export const getEducationQualifications = async () => {
  const response = await api.get("/education-qualifications");
  return response.data;
};

/**
 * Get list of available education qualification grades
 * @returns {Promise} - Axios response payload with list of grades
 */
export const getEducationQualificationGrades = async () => {
  const response = await api.get("/education-qualification-grades");
  return response.data;
};

/**
 * Add a service history entry for a teacher
 * @param {string} peopleId - The teacher's people_id
 * @param {Object} data - History entry details
 * @returns {Promise} - Axios response payload
 */
export const addServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/teachers/${peopleId}/service-history`, data);
  return response.data;
};

export const addPastService = async (peopleId, data) => {
  const response = await api.post(`/teachers/${peopleId}/past-services`, data);
  return response.data;
};
