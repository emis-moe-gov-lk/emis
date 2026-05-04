import { useAuthUser } from "@/context/useAuthUser";

const Can = ({ permission, children, fallback = null }) => {
  const { identity } = useAuthUser();
  const userPermissions = identity?.permissions || [];

  if (!userPermissions.includes(permission)) {
    return fallback;
  }

  return children;
};

export default Can;
