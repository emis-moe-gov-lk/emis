import { getEnv } from "./utils/env";

export const asgardeoConfig = {
  clientID: getEnv("VITE_ASGARDEO_CLIENT_ID"),
  baseUrl: getEnv("VITE_ASGARDEO_BASE_URL"),
  signInRedirectURL:
    getEnv("VITE_SIGNIN_REDIRECT_URL") ||
    window.location.origin + "/authentication/callback",
  signOutRedirectURL:
    getEnv("VITE_SIGNOUT_REDIRECT_URL") || window.location.origin,
  scope: ["openid", "profile", "email", "roles", "phone"],
  enablePKCE: true,
  storage: "sessionStorage",
  sendCookiesInRequests: true,
};
