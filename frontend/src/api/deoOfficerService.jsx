import api from "./axios";

export const registerDeoOfficer = async (data) => {
  const response = await api.post("/deo-officers", data);
  return response.data;
};

export const checkDeoOfficerContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

export const printDeoOfficerId = async (id) => {
  const response = await api.get(`/pdf/id/${id}`, { responseType: "blob" });
  return response.data;
};

export const downloadDeoOfficerProfileDocument = async (id) => {
  const response = await api.get(`/pdf/teacher/${id}`, {
    responseType: "arraybuffer",
  });
  return response;
};

export const getDosAdmin = async (id) => {
  const response = await api.get(`/dos-admins/${id}`);
  return response.data;
};

export const addDosAdminServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/dos-admins/${peopleId}/service-history`, data);
  return response.data;
};

export const addDosAdminPastService = async (peopleId, data) => {
  const response = await api.post(`/dos-admins/${peopleId}/past-services`, data);
  return response.data;
};

