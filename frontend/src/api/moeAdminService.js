import api from "./axios";

export const registerMoeAdmin = async (data) => {
  const response = await api.post("/moe-admins", data);
  return response.data;
};

export const checkMoeAdminContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

export const getAllMoeAdmins = async (params = {}) => {
  const response = await api.get("/moe-admins", { params });
  return response.data;
};

export const getMoeAdminById = async (id) => {
  const response = await api.get(`/moe-admins/${id}`);
  return response.data;
};

export const updateMoeAdmin = async (id, data) => {
  const response = await api.put(`/moe-admins/${id}`, data);
  return response.data;
};

export const deleteMoeAdmin = async (id) => {
  const response = await api.delete(`/moe-admins/${id}`);
  return response.data;
};

export const getMoeAdminFormData = async (params = {}) => {
  const response = await api.get("/moe-admins/form-data", { params });
  return response.data;
};

export const getMoeAdminCurrentAppointmentFormData = async (params = {}) => {
  const response = await api.get("/moe-admins/current-appointment-form-data", { params });
  return response.data;
};

export const addMoeAdminServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/moe-admins/${peopleId}/service-history`, data);
  return response.data;
};

export const addMoeAdminPastService = async (peopleId, data) => {
  const response = await api.post(`/moe-admins/${peopleId}/past-services`, data);
  return response.data;
};
