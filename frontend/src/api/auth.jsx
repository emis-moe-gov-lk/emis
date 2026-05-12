import api from "./axios";

const normalizeIdentityPayload = (responseData) => {
  const payload = responseData?.data ?? responseData ?? {};
  const data = payload?.data ?? payload;

  return {
    token: data?.token ?? null,
    user: data?.user ?? null,
    peopleId: data?.people_id ?? data?.user?.people_id ?? null,
    roles: Array.isArray(data?.roles) ? data.roles : [],
    permissions: Array.isArray(data?.permissions) ? data.permissions : [],
    primaryRole: data?.primary_role ?? null,
    workplace: data?.workplace ?? null,
    officeLevel: data?.office_level ?? null,
    officeLevelId: data?.office_level_id ?? null,
    mustChangePassword: Boolean(data?.must_change_password ?? data?.user?.must_change_password),
    passwordChangeRequiredReason: data?.password_change_required_reason ?? null,
    identityProvider: data?.identity_provider ?? data?.user?.identity_provider ?? null,
    raw: data ?? {},
  };
};

export const getIdentity = async () => {
  const response = await api.get("/identity");
  return normalizeIdentityPayload(response?.data);
};

export const getPermissionCatalog = async () => {
  const response = await api.get("/permissions");
  const payload = response?.data?.data ?? response?.data ?? {};

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return Object.entries(payload).reduce((acc, [category, permissions]) => {
    acc[category] = Array.isArray(permissions)
      ? permissions.map((permission) => String(permission)).filter(Boolean)
      : [];
    return acc;
  }, {});
};

export const changeOwnPassword = async (payload) => {
  const response = await api.patch("/profile/password", payload);
  return response?.data;
};

export const completeExternalPasswordChange = async () => {
  const response = await api.post("/profile/password/complete-external");
  return response?.data;
};
