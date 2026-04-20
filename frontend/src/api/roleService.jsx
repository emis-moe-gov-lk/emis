import api from "./axios";

const toNonEmptyString = (value) => (typeof value === "string" ? value.trim() : "");

const toGroupedPermissions = (permissions) => {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
    return {};
  }

  return Object.entries(permissions).reduce((acc, [category, values]) => {
    acc[category] = Array.isArray(values)
      ? values.map((value) => String(value)).filter(Boolean)
      : [];

    return acc;
  }, {});
};

const toRoleModel = (role) => {
  const groupedPermissions = toGroupedPermissions(role?.permissions);
  const fallbackCount = Object.values(groupedPermissions).reduce(
    (count, values) => count + values.length,
    0,
  );

  return {
    id: role?.id,
    name: role?.name ?? "",
    groupedPermissions,
    permissionCount: role?.permission_count ?? fallbackCount,
  };
};

const toSelectedPermissions = (groupedPermissions) => {
  return Object.entries(groupedPermissions).flatMap(([category, permissions]) =>
    permissions.map((permission) => `${category}.${permission}`),
  );
};

const toPermissionNames = (permissions) => {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions
    .map((permission) =>
      typeof permission === "string" ? permission : permission?.name ?? "",
    )
    .filter(Boolean);
};

const toUniquePermissionNames = (permissionNames) => {
  if (!Array.isArray(permissionNames)) {
    return [];
  }

  return Array.from(
    new Set(
      permissionNames
        .map((permissionName) => toNonEmptyString(permissionName))
        .filter(Boolean),
    ),
  );
};

const toGroupedByPermissionNames = (permissionNames) => {
  return permissionNames.reduce((acc, permissionName) => {
    const [category, ...rest] = permissionName.split(".");
    const suffix = rest.join(".");

    if (!category || !suffix) {
      return acc;
    }

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(suffix);
    return acc;
  }, {});
};

export const getRoles = async () => {
  const response = await api.get("/roles");
  const roles = Array.isArray(response?.data?.data) ? response.data.data : [];

  return roles.map(toRoleModel);
};

export const getRolePermissions = async (roleId) => {
  const response = await api.get(`/permissions/${roleId}`);
  const payload = response?.data?.data ?? response?.data ?? {};
  const role = Array.isArray(payload) ? payload[0] ?? {} : payload;
  const permissionNames = toPermissionNames(role?.permissions);

  if (permissionNames.length > 0) {
    const groupedPermissions = toGroupedByPermissionNames(permissionNames);

    return {
      id: role?.id ?? roleId,
      name: role?.role_name ?? role?.name ?? "",
      groupedPermissions,
      permissionCount: permissionNames.length,
      selectedPermissions: permissionNames,
    };
  }

  const roleModel = toRoleModel(role);

  return {
    ...roleModel,
    selectedPermissions: toSelectedPermissions(roleModel.groupedPermissions),
  };
};

export const buildRolePayload = (roleName, selectedPermissions) => ({
  role_name: toNonEmptyString(roleName),
  selectedPermissions: toUniquePermissionNames(selectedPermissions),
});

export const createRole = async (roleName, selectedPermissions) => {
  const response = await api.post("/roles", buildRolePayload(roleName, selectedPermissions));
  return response?.data;
};

export const updateRole = async (roleId, roleName, selectedPermissions) => {
  const response = await api.put(
    `/roles/${roleId}`,
    buildRolePayload(roleName, selectedPermissions),
  );
  return response?.data;
};

export const deleteRole = async (roleId) => {
  const response = await api.delete(`/permissions/${roleId}`);
  return response?.data;
};

export const parseRoleApiError = (error, fallbackMessage) => {
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
