import api from "./axios";

export const getTeacherSettings = () => api.get("/teacher-settings");

export const getPersonalFormData = (district = "", dsOffice = "") =>
  api.get("/teachers/personal-form-data", {
    params: {
      ...(district && { district }),
      ...(dsOffice && { ds_office: dsOffice }),
    },
  });

export const getAppointmentFormData = (params = {}) =>
  api.get("/register/appointment-form-data", { params });

export const updateTeacherSection = (peopleId, section, data) =>
  api.patch(`/teachers/${peopleId}`, data, { params: { section } });

export const updatePersonSection = (peopleId, section, data) =>
  api.patch(`/people/${peopleId}`, data, { params: { section } });
