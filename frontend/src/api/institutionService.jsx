import api from "./axios";

// Get institution list (with pagination)
export const getInstitutions = (page = 1, limit = 20) => {
  return api.get(`/institutions?page=${page}&limit=${limit}`);
};

// Create a new institution
export const createInstitution = (data) => {
  return api.post("/institutions", data);
};

// Update institution
export const updateInstitution = (id, data) => {
  return api.put(`/institutions/${id}`, data);
};

// Delete institution
export const deleteInstitution = (id) => {
  return api.delete(`/institutions/${id}`);
};
