import api from "./axios";

export const registerProvincialDeo = async (data) => {
  const response = await api.post("/provincial-deos", data);
  return response.data;
};

export const checkProvincialDeoContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

export const getAllProvincialDeos = async (params = {}) => {
  const response = await api.get("/provincial-deos", { params });
  return response.data;
};

export const getProvincialDeoById = async (id) => {
  const response = await api.get(`/provincial-deos/${id}`);
  return response.data;
};

export const updateProvincialDeo = async (id, data) => {
  const response = await api.put(`/provincial-deos/${id}`, data);
  return response.data;
};

export const deleteProvincialDeo = async (id) => {
  const response = await api.delete(`/provincial-deos/${id}`);
  return response.data;
};

export const getProvincialDeoFormData = async (params = {}) => {
  const response = await api.get("/provincial-deos/form-data", { params });
  return response.data;
};

export const getProvincialDeoCurrentAppointmentFormData = async (params = {}) => {
  const response = await api.get("/provincial-deos/current-appointment-form-data", { params });
  return response.data;
};

export const addProvincialDeoServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/provincial-deos/${peopleId}/service-history`, data);
  return response.data;
};

export const addProvincialDeoPastService = async (peopleId, data) => {
  const response = await api.post(`/provincial-deos/${peopleId}/past-services`, data);
  return response.data;
};
