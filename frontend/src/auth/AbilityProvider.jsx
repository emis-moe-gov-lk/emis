import React, { useEffect, useMemo } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import toast from "react-hot-toast";
import { defineAbilityFor } from "./ability";
import { AbilityContext } from "./AbilityContext";
import { useAuthUser } from "@/context/useAuthUser";

export const AbilityProvider = ({ children }) => {
  const { on } = useAuthContext();
  const { permissions, roles } = useAuthUser();

  useEffect(() => {
    const handleSignOut = () => {
      toast.error("Session expired or signed out. Redirecting...", {
        id: "session-expiry-toast",
      });
    };

    on("sign-out", handleSignOut);
    on("session-terminated", handleSignOut);
  }, [on]);

  const ability = useMemo(
    () => defineAbilityFor({ roles, permissions }),
    [permissions, roles],
  );

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
