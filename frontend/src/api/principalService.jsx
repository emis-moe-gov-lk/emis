import api from "./axios";

export const addServiceHistoryEntry = async (peopleId, data) => {
  const response = await api.post(`/principals/${peopleId}/service-history`, data);
  return response.data;
};

export const addPastService = async (peopleId, data) => {
  const response = await api.post(`/principals/${peopleId}/past-services`, data);
  return response.data;
};

export const registerPrincipal = async (data) => {
  const response = await api.post("/principal-create", data);
  return response.data;
};

export const checkPrincipalContact = async (data) => {
  const response = await api.post("/teachers/check-contact", data);
  return response.data;
};

export const printPrincipalId = async (id) => {
  const response = await api.get(`/pdf/id/${id}`, { responseType: "blob" });
  return response.data;
};

export const downloadPrincipalProfileDocument = async (id) => {
  const response = await api.get(`/pdf/principal/${id}`, {
    responseType: "arraybuffer",
  });
  return response;
};
