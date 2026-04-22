import { useContext } from "react";
import { AuthUserContext } from "./AuthUserContext.jsx";

export function useAuthUser() {
  return useContext(AuthUserContext);
}
