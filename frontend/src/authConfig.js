export const asgardeoConfig = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
  signInRedirectURL:
    import.meta.env.VITE_SIGNIN_REDIRECT_URL ||
    window.location.origin + "/authentication/callback",
  signOutRedirectURL:
    import.meta.env.VITE_SIGNOUT_REDIRECT_URL || window.location.origin,
  scope: ["openid", "profile", "email", "teacher-scope", "roles", "phone"],
  enablePKCE: true,
  storage: "sessionStorage",
  sendCookiesInRequests: true,
};
