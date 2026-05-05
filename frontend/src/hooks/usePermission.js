import { useAuthUser } from "@/context/useAuthUser";

export const usePermission = () => {
  const { identity } = useAuthUser();

  const userPermissions = identity?.permissions || [];

  // Check single permission
  const can = (permission) => {
    return userPermissions.includes(permission);
  };

  // Check if user has ANY permission
  const canAny = (permissions = []) => {
    return permissions.some((p) => userPermissions.includes(p));
  };

  // Check if user has ALL permissions
  const canAll = (permissions = []) => {
    return permissions.every((p) => userPermissions.includes(p));
  };

  return {
    can,
    canAny,
    canAll,
    permissions: userPermissions,
  };
};