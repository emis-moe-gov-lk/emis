import api from "./axios";

export const getAllMoeAdministrators = async (params = {}) => {
  const response = await api.get("/moe-administrators", { params });
  return response.data;
};

export const getMoeAdministratorById = async (id) => {
  const response = await api.get(`/moe-administrators/${id}`);
  return response.data;
};

export const createMoeAdministrator = async (data) => {
  const response = await api.post("/moe-administrators", data);
  return response.data;
};

export const addMoeAdministratorServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/moe-administrators/${peopleId}/service-history`, data);
  return response.data;
};

export const addMoeAdministratorPastService = async (peopleId, data) => {
  const response = await api.post(`/moe-administrators/${peopleId}/past-services`, data);
  return response.data;
};

export const updateMoeAdministrator = async (id, data) => {
  const response = await api.patch(`/moe-administrators/${id}`, data);
  return response.data;
};
