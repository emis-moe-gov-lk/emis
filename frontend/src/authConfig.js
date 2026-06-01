export const asgardeoConfig = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
  signInRedirectURL:
    import.meta.env.VITE_SIGNIN_REDIRECT_URL ||
    window.location.origin + "/authentication/callback",
  signOutRedirectURL:
    import.meta.env.VITE_SIGNOUT_REDIRECT_URL || window.location.origin,
  scope: ["openid", "profile", "email", "roles", "phone"],
  enablePKCE: true,
  storage: "sessionStorage",
  sendCookiesInRequests: true,
  // WSO2 IS 7.x exposes discovery at /oauth2/token/.well-known/openid-configuration
  wellKnownEndpoint: import.meta.env.VITE_ASGARDEO_BASE_URL + "/oauth2/token/.well-known/openid-configuration",
  // Silent sign-in via hidden iframe requires third-party cookies; disable to avoid
  // the SPA-AUTH_CLIENT-ON-IV01 "invalid hook" error thrown when the iframe flow fails
  disableTrySignInSilently: true,
};
