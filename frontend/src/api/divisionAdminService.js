import api from "./axios";

export const registerDivisionAdmin = async (data) => {
  const response = await api.post("/division-admins", data);
  return response.data;
};

export const getAllDivisionAdmins = async (params = {}) => {
  const response = await api.get("/division-admins", { params });
  return response.data;
};

export const getDivisionAdminById = async (id) => {
  const response = await api.get(`/division-admins/${id}`);
  return response.data;
};

export const addDivisionAdminServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/division-admins/${peopleId}/service-history`, data);
  return response.data;
};

export const addDivisionAdminPastService = async (peopleId, data) => {
  const response = await api.post(`/division-admins/${peopleId}/past-services`, data);
  return response.data;
};

export const downloadDivisionAdminProfileDocument = async (id, format = "pdf") => {
  const response = await api.get(`/pdf/division-admin/${id}?format=${format}`, {
    responseType: "arraybuffer",
  });
  return response.data;
};
