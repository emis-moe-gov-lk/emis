// src/api/userService.jsx
import api from "./axios";

export const USER_LIST_PER_PAGE = 10;

const normalizeUsersListResponse = (responseData) => {
  const paginator = responseData?.data ?? {};
  const users = Array.isArray(paginator?.data) ? paginator.data : [];

  return {
    users,
    total: paginator.total ?? users.length,
    currentPage: paginator.current_page ?? 1,
    lastPage: paginator.last_page ?? 1,
    perPage: paginator.per_page ?? USER_LIST_PER_PAGE,
    from: paginator.from ?? (users.length > 0 ? 1 : 0),
    to: paginator.to ?? users.length,
  };
};

const normalizeUserDetailResponse = (responseData) => {
  const payload = responseData?.data ?? responseData;

  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
};

const toNonEmptyString = (value) => (typeof value === "string" ? value.trim() : "");

const toUniqueRoleNames = (roles) => {
  if (!Array.isArray(roles)) return [];
  return Array.from(new Set(roles.map((role) => toNonEmptyString(role)).filter(Boolean)));
};

export const getUsers = async ({
  page = 1,
  perPage = USER_LIST_PER_PAGE,
  search = "",
} = {}) => {
  const response = await api.get("/users/", {
    params: {
      page,
      per_page: perPage,
      search: search || undefined,
    },
  });
  return normalizeUsersListResponse(response?.data);
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return normalizeUserDetailResponse(response?.data);
};

export const toggleUserStatus = async (userId) =>
  (await api.patch(`/users/${userId}/toggle-status`)).data;

export const deleteUserById = async (userId) =>
  (await api.delete(`/users/${userId}`)).data;

export const resetUserPassword = async (userId, password, confirmPassword) =>
  (
    await api.post(`/users/${userId}/reset-password`, {
      password,
      password_confirmation: confirmPassword,
    })
  ).data;

export const buildCreateUserPayload = (formData) => {
  const roleNames = toUniqueRoleNames(formData?.roles);
  return {
    name: toNonEmptyString(formData?.name),
    nic: toNonEmptyString(formData?.nic),
    contact: toNonEmptyString(formData?.contactNumber),
    email: toNonEmptyString(formData?.email),
    password: formData?.password ?? "",
    password_confirmation: formData?.confirmPassword ?? "",
    roles: roleNames,
  };
};

export const createUser = async (formData) =>
  (await api.post("/users/", buildCreateUserPayload(formData))).data;

export const buildUpdateUserPayload = (formData) => {
  const basePayload = {
    name: toNonEmptyString(formData?.name),
    nic: toNonEmptyString(formData?.nic),
    contact: toNonEmptyString(formData?.contactNumber),
    email: toNonEmptyString(formData?.email),
    roles: toUniqueRoleNames(formData?.roles),
  };

  const reason = toNonEmptyString(formData?.reason);
  if (reason) {
    basePayload.reason = reason;
  }

  const password = formData?.password ?? "";
  const confirmPassword = formData?.confirmPassword ?? "";

  if (password || confirmPassword) {
    return {
      ...basePayload,
      password,
      password_confirmation: confirmPassword,
    };
  }
  return basePayload;
};

export const updateUser = async (userId, formData) => {
  const payload = buildUpdateUserPayload(formData);
  const response = await api.patch(`/users/${userId}`, payload);
  return response?.data;
};

export const parseUserApiError = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  const fieldErrors = responseData?.errors ?? {};
  const firstFieldError = Object.values(fieldErrors).find(
    (messages) => Array.isArray(messages) && messages.length > 0,
  );
  return {
    message:
      firstFieldError?.[0] ??
      responseData?.message ??
      responseData?.error ??
      fallbackMessage,
    fieldErrors,
  };
};


// Get logged-in user profile - FIXED to match your API
export const getUserProfile = () => {
  const peopleId = localStorage.getItem("peopleId");
  return api.get(`/user/${peopleId}`);
};

// Update user profile - FIXED to match your API
export const updateUserProfile = (data) => {

  return api.patch(`/profile`, data);
};

// Edit requests
export const submitEditRequest = (data) =>
  api.post("/profile/edit-requests", data);

export const getEditRequests = (peopleId) =>
  api.get(`/user/${peopleId}/edit-requests`);

export const reviewEditRequest = (id, data) =>
  api.patch(`/profile/edit-requests/${id}`, data);

export const getZonalEditRequests = (params = {}) =>
  api.get("/alerts/edit-requests", { params });