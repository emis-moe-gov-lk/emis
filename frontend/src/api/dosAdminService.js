/**
 * DOS Admin Service - DOS Admin Registration and Management API Service
 * 
 * Provides API functions for DOS Admin registration, profile management,
 * and document operations. All functions use the centralized axios instance
 * which handles authentication automatically.
 * 
 * @module dosAdminService
 */

import api from "./axios";

/**
 * Registers a new DOS Admin user
 * Submits complete registration form data to backend
 * 
 * @async
 * @param {Object} data - DOS Admin registration data
 * @param {string} data.nic - National Identity Card number
 * @param {string} data.fullName - Full name of DOS Admin
 * @param {string} data.dateOfBirth - Date of birth (YYYY-MM-DD)
 * @param {string} data.titleId - Title/honorific ID
 * @param {string} data.genderId - Gender ID
 * @param {string} data.religionId - Religion ID
 * @param {string} data.ethnicityId - Ethnicity ID
 * @param {string} data.civilStatusId - Civil status ID
 * @param {string} data.bloodGroupId - Blood group ID
 * @param {string} data.email - Email address
 * @param {string} data.contact - Phone number
 * @param {string} data.addressLine1 - Permanent address line 1
 * @param {string} data.addressLine2 - Permanent address line 2
 * @param {string} data.postalCode - Postal code
 * @param {string} data.currentAppointmentService - Service ID
 * @param {string} data.currentAppointmentRank - Rank ID
 * @param {string} data.currentAppointmentPosition - Position ID
 * @param {string} data.currentAppointmentZone - Zone/institution ID
 * @returns {Promise<Object>} Registration response with confirmation
 * @returns {Promise<string>} returns.status - 'success' or 'error'
 * @returns {Promise<Object>} returns.data - Created DOS Admin object
 * @throws {Error} If registration fails
 * 
 * @example
 * const result = await registerDosAdmin({
 *   nic: '900000000001',
 *   fullName: 'John Doe',
 *   email: 'john@example.com',
 *   ...otherFields
 * });
 */
export const registerDosAdmin = async (data) => {
  const response = await api.post("/deo-officers", data);
  return response.data;
};

/**
 * Checks if contact information (email/phone) is available
 * Used during registration to prevent duplicate contacts
 * 
 * @async
 * @param {Object} data - Contact data to validate
 * @param {string} data.email - Email address to check
 * @param {string} data.phone - Phone number to check (optional)
 * @param {string} data.exclude_id - DOS Admin ID to exclude from check (for updates)
 * @returns {Promise<Object>} Validation result
 * @returns {Promise<boolean>} returns.email_available - True if email is unique
 * @returns {Promise<boolean>} returns.phone_available - True if phone is unique
 * @throws {Error} If validation fails
 * 
 * @example
 * const validation = await checkDosAdminContact({
 *   email: 'dos@example.com',
 *   phone: '0700000000'
 * });
 * if (validation.email_available) {
 *   // Email is available
 * }
 */
export const checkDosAdminContact = async (data) => {
  const response = await api.post("/dos-admins/check-contact", data);
  return response.data;
};

/**
 * Prints/generates DOS Admin ID card as PDF
 * Returns blob that can be opened in new window or downloaded
 * 
 * @async
 * @param {string} id - DOS Admin ID (people_id)
 * @returns {Promise<Blob>} PDF document blob for ID card
 * @throws {Error} If PDF generation fails
 * 
 * @example
 * const pdfBlob = await printDosAdminId('PEO001');
 * const url = window.URL.createObjectURL(pdfBlob);
 * window.open(url);
 */
export const printDosAdminId = async (id) => {
  const response = await api.get(`/pdf/dos-admin-id/${id}`, { responseType: "blob" });
  return response.data;
};

/**
 * Downloads DOS Admin profile document (complete profile/certificate)
 * Returns complete profile document in specified format
 * 
 * @async
 * @param {string} id - DOS Admin ID (people_id)
 * @param {string} format - Document format ('pdf', 'docx', etc.) - default 'pdf'
 * @returns {Promise<ArrayBuffer>} Document content as ArrayBuffer
 * @throws {Error} If document generation fails
 * 
 * @example
 * const docBuffer = await downloadDosAdminProfileDocument('PEO001');
 * // Save to file or display
 * const blob = new Blob([docBuffer], { type: 'application/pdf' });
 * const url = window.URL.createObjectURL(blob);
 * const link = document.createElement('a');
 * link.href = url;
 * link.download = 'dos-admin-profile.pdf';
 * link.click();
 */
export const downloadDosAdminProfileDocument = async (id, format = "pdf") => {
  const response = await api.get(`/pdf/dos-admin/${id}?format=${format}`, {
    responseType: "arraybuffer",
  });
  return response.data;
};

/**
 * Fetches all DOS Admins (development officers at zonal/national level)
 * Supports pagination and filtering
 * 
 * @async
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.per_page - Results per page
 * @param {string} params.search - Search term (NIC, name, etc.)
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} Paginated DOS Admin list
 * @returns {Promise<Array>} returns.data - Array of DOS Admin objects
 * @returns {Promise<Object>} returns.pagination - Pagination metadata
 * @throws {Error} If fetch fails
 * 
 * @example
 * const result = await getAllDosAdmins({ page: 1, per_page: 20 });
 * console.log(result.data); // Array of DOS Admins
 */
export const getAllDosAdmins = async (params = {}) => {
  const response = await api.get("/dos-admins", { params });
  return response.data;
};

/**
 * Fetches a single DOS Admin's complete profile
 * Includes appointment history, contacts, and all details
 * 
 * @async
 * @param {string} id - DOS Admin ID (people_id or appointment_id)
 * @returns {Promise<Object>} Complete DOS Admin profile object
 * @returns {Promise<string>} returns.id - DOS Admin unique ID
 * @returns {Promise<string>} returns.full_name - Full name
 * @returns {Promise<Object>} returns.current_appointment - Current position details
 * @throws {Error} If DOS Admin not found
 * 
 * @example
 * const dosAdmin = await getDosAdminById('PEO001');
 * console.log(dosAdmin.full_name, dosAdmin.current_appointment);
 */
export const getDosAdminById = async (id) => {
  const response = await api.get(`/dos-admins/${id}`);
  return response.data;
};

/**
 * Updates an existing DOS Admin's profile
 * Only allows updating non-appointment fields
 * 
 * @async
 * @param {string} id - DOS Admin ID
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} Updated DOS Admin object
 * @throws {Error} If update fails
 * 
 * @example
 * const updated = await updateDosAdmin('PEO001', {
 *   email: 'newemail@example.com',
 *   contact: '0700000000'
 * });
 */
export const updateDosAdmin = async (id, data) => {
  const response = await api.patch(`/dos-admins/${id}`, data);
  return response.data;
};

/**
 * Searches for DOS Admins by multiple criteria
 * Supports filtering by various fields
 * 
 * @async
 * @param {Object} criteria - Search criteria
 * @param {string} criteria.nic - National ID number
 * @param {string} criteria.fullName - Full name search
 * @param {string} criteria.email - Email search
 * @param {string} criteria.serviceId - Service ID filter
 * @param {string} criteria.positionId - Position ID filter
 * @returns {Promise<Object>} Search results
 * @throws {Error} If search fails
 * 
 * @example
 * const results = await searchDosAdmins({ 
 *   nic: '900000000001',
 *   status: 'active'
 * });
 */
export const searchDosAdmins = async (criteria = {}) => {
  const response = await api.get("/dos-admins", { params: criteria });
  return response.data;
};

/**
 * Deletes a DOS Admin record (soft delete)
 * May fail if DOS Admin has associated appointments or dependencies
 * 
 * @async
 * @param {string} id - DOS Admin ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails or dependencies exist
 * 
 * @example
 * await deleteDosAdmin('PEO001');
 * // DOS Admin record is soft-deleted
 */
export const deleteDosAdmin = async (id) => {
  const response = await api.delete(`/dos-admins/${id}`);
  return response.data;
};

/**
 * Gets appointment history for a DOS Admin
 * Returns complete history of position changes
 * 
 * @async
 * @param {string} id - DOS Admin ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Max records to return
 * @returns {Promise<Array>} Appointment history records
 * @throws {Error} If fetch fails
 * 
 * @example
 * const history = await getDosAdminAppointmentHistory('PEO001');
 */
export const getDosAdminAppointmentHistory = async (id, params = {}) => {
  const response = await api.get(`/dos-admins/${id}/appointments`, { params });
  return response.data;
};

/**
 * Exports DOS Admin data in specified format
 * Useful for reports and bulk operations
 * 
 * @async
 * @param {string} format - Export format ('csv', 'excel', 'pdf')
 * @param {Object} filters - Data filters for export
 * @returns {Promise<Blob>} Exported file blob
 * @throws {Error} If export fails
 * 
 * @example
 * const csvBlob = await exportDosAdmins('csv');
 * // Download or process CSV file
 */
export const exportDosAdmins = async (format = "csv", filters = {}) => {
  const response = await api.get("/dos-admins/export", {
    params: { format, ...filters },
    responseType: "blob",
  });
  return response.data;
};
