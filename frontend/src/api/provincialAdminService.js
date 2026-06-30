import api from "./axios";

export const registerProvincialAdmin = async (data) => {
  const response = await api.post("/provincial-admins", data);
  return response.data;
};

export const getAllProvincialAdmins = async (params = {}) => {
  const response = await api.get("/provincial-admins", { params });
  return response.data;
};

export const getProvincialAdminById = async (id) => {
  const response = await api.get(`/provincial-admins/${id}`);
  return response.data;
};

export const addProvincialAdminServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/provincial-admins/${peopleId}/service-history`, data);
  return response.data;
};

export const addProvincialAdminPastService = async (peopleId, data) => {
  const response = await api.post(`/provincial-admins/${peopleId}/past-services`, data);
  return response.data;
};

export const downloadProvincialAdminProfileDocument = async (id, format = "pdf") => {
  const response = await api.get(`/pdf/teacher/${id}?format=${format}`, {
    responseType: "arraybuffer",
  });
  return response.data;
};
