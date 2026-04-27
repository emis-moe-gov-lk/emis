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
