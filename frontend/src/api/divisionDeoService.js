import api from "./axios";

export const registerDivisionDeo = async (data) => {
  const response = await api.post("/division-deos", data);
  return response.data;
};

export const checkDivisionDeoContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

export const getAllDivisionDeos = async (params = {}) => {
  const response = await api.get("/division-deos", { params });
  return response.data;
};

export const getDivisionDeoById = async (id) => {
  const response = await api.get(`/division-deos/${id}`);
  return response.data;
};

export const updateDivisionDeo = async (id, data) => {
  const response = await api.put(`/division-deos/${id}`, data);
  return response.data;
};

export const deleteDivisionDeo = async (id) => {
  const response = await api.delete(`/division-deos/${id}`);
  return response.data;
};

export const getDivisionDeoFormData = async (params = {}) => {
  const response = await api.get("/division-deos/form-data", { params });
  return response.data;
};

export const getDivisionDeoCurrentAppointmentFormData = async (params = {}) => {
  const response = await api.get("/division-deos/current-appointment-form-data", { params });
  return response.data;
};

export const addDivisionDeoServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/division-deos/${peopleId}/service-history`, data);
  return response.data;
};

export const addDivisionDeoPastService = async (peopleId, data) => {
  const response = await api.post(`/division-deos/${peopleId}/past-services`, data);
  return response.data;
};
