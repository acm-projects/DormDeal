// MSAL configuration for the "DormDeal" Entra app registration.
const tenant = import.meta.env.VITE_ENTRA_TENANT_ID || "common";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${tenant}`,
    // Entra sends the user (and the auth response) back to this URL.
    // It must match the Redirect URI configured in the Entra app exactly.
    redirectUri:
      import.meta.env.VITE_ENTRA_REDIRECT_URI ||
      `${window.location.origin}/auth/callback`,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: { cacheLocation: "sessionStorage" },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};
