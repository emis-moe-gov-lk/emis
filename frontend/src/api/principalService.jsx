import api from "./axios";

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
