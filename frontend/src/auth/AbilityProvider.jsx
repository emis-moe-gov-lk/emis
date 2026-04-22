import React, { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import toast from "react-hot-toast";
import { defineAbilityFor } from "./ability";
import { AbilityContext } from "./AbilityContext";

export const AbilityProvider = ({ children }) => {
  const { state, getDecodedIDToken, on } = useAuthContext();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const handleSignOut = () => {
      console.log("Session ended: clearing roles");
      setRoles([]);
      toast.error("Session expired or signed out. Redirecting...", {
        id: "session-expiry-toast", // Prevent duplicates
      });
    };

    on("sign-out", handleSignOut);
    on("session-terminated", handleSignOut);

    if (state.isAuthenticated) {
      getDecodedIDToken()
        .then((token) => {
          // Asgardeo might put roles in 'groups', 'role', or 'roles' depending on configuration
          const userRoles = token?.roles || token?.groups || token?.role || [];
          setRoles(Array.isArray(userRoles) ? userRoles : [userRoles]);
        })
        .catch((err) => {
          console.error("Error fetching roles for ability:", err);
          setRoles([]);
        });
    } else {
      setRoles([]);
    }
  }, [state.isAuthenticated, getDecodedIDToken, on]);

  const ability = useMemo(() => defineAbilityFor({ roles }), [roles]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
