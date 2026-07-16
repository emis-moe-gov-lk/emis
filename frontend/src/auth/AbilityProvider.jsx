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
    let redirected = false;

    const handleSessionEnd = () => {
      if (redirected) return;
      redirected = true;
      toast.error("Session expired. Redirecting to login.", {
        id: "session-expiry-toast",
      });
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/logout";
    };

    on("sign-out", handleSessionEnd);
    on("session-terminated", handleSessionEnd);

    return () => {
      redirected = true;
    };
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
