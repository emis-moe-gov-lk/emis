import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { getIdentity } from "@/api/auth";

// Context
export const AuthUserContext = createContext(null);

const IDENTITY_STORAGE_KEY = "identityData";

const toLower = (value) => String(value ?? "").trim().toLowerCase();

const persistIdentity = (identity) => {
  if (!identity) {
    localStorage.removeItem("peopleId");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    localStorage.removeItem("gender");
    localStorage.removeItem("roles");
    localStorage.removeItem(IDENTITY_STORAGE_KEY);
    return;
  }

  localStorage.setItem("peopleId", identity.peopleId ?? "");
  localStorage.setItem("email", identity.user?.email ?? "");
  localStorage.setItem("name", identity.user?.name ?? "");
  localStorage.setItem("username", identity.user?.name ?? "");
  localStorage.setItem("gender", identity.user?.gender ?? "");
  localStorage.setItem("roles", JSON.stringify(identity.roles ?? []));
  localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity.raw ?? {}));
};

// Provider
export function AuthUserProvider({ children }) {
  const { state, signOut } = useAuthContext();
  const [identity, setIdentity] = useState(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [error, setError] = useState(null);

  const clearIdentity = useCallback(() => {
    setIdentity(null);
    setError(null);
    persistIdentity(null);
  }, []);

  const hydrateIdentity = useCallback(async () => {
    if (!state.isAuthenticated) {
      clearIdentity();
      return null;
    }

    setIsHydrating(true);
    setError(null);

    try {
      const nextIdentity = await getIdentity();
      setIdentity(nextIdentity);
      persistIdentity(nextIdentity);
      return nextIdentity;
    } catch (nextError) {
      setError(nextError);
      if (nextError.response?.status === 401) {
        clearIdentity();
      }
      throw nextError;
    } finally {
      setIsHydrating(false);
    }
  }, [clearIdentity, state.isAuthenticated]);

  useEffect(() => {
    if (!state.isAuthenticated) {
      clearIdentity();
      return;
    }

    hydrateIdentity().catch((hydrateError) => {
      console.error("Failed to hydrate identity:", hydrateError);
    });
  }, [clearIdentity, hydrateIdentity, state.isAuthenticated]);

  const value = useMemo(() => {
    const roles = Array.isArray(identity?.roles) ? identity.roles : [];
    const permissions = Array.isArray(identity?.permissions)
      ? identity.permissions
      : [];
    const normalizedRoles = roles.map(toLower);

    const hasRole = (roleName) => normalizedRoles.includes(toLower(roleName));
    const hasPermission = (permissionName) =>
      permissions.includes(String(permissionName ?? "").trim());
    const hasAnyPermission = (permissionNames = []) =>
      permissionNames.some((permissionName) => hasPermission(permissionName));

    return {
      identity,
      user: identity?.user ?? null,
      roles,
      permissions,
      primaryRole: identity?.primaryRole ?? null,
      peopleId: identity?.peopleId ?? null,
      workplace: identity?.workplace ?? null,
      officeLevel: identity?.officeLevel ?? null,
      officeLevelId: identity?.officeLevelId ?? null,
      mustChangePassword: Boolean(identity?.mustChangePassword),
      passwordChangeRequiredReason: identity?.passwordChangeRequiredReason ?? null,
      identityProvider: identity?.identityProvider ?? null,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading || isHydrating,
      error,
      hydrateIdentity,
      clearIdentity,
      setUser: (user) =>
        setIdentity((current) => {
          const nextIdentity = {
            ...(current ?? {}),
            user,
            raw: {
              ...(current?.raw ?? {}),
              user,
            },
          };
          persistIdentity(nextIdentity);
          return nextIdentity;
        }),
      hasRole,
      hasPermission,
      hasAnyPermission,
    };
  }, [clearIdentity, error, hydrateIdentity, identity, isHydrating, state.isAuthenticated, state.isLoading]);

  return (
    <AuthUserContext.Provider value={value}>
      {children}
    </AuthUserContext.Provider>
  );
}
