import { useAuthUser } from "@/context/useAuthUser";

const CanAny = ({ permissions = [], children, fallback = null }) => {
  const { identity } = useAuthUser();
  const userPermissions = identity?.permissions || [];

  const hasAccess = permissions.some((p) => userPermissions.includes(p));

  if (!hasAccess) return fallback;

  return children;
};

export default CanAny;
