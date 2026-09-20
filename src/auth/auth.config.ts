import type { AuthConfig } from "./auth.types"

export function getAuthConfig(): AuthConfig {
  return {
    authEnabled: import.meta.env.VITE_AUTH_ENABLED === "true",
    authorizationUrl: import.meta.env.VITE_SSO_AUTHORIZATION_URL || "",
    backendCallbackEndpoint: import.meta.env.VITE_BACKEND_SSO_CALLBACK_ENDPOINT || "/auth/sso/callback",
    clientId: import.meta.env.VITE_SSO_CLIENT_ID || "",
    redirectUri:
      import.meta.env.VITE_SSO_REDIRECT_URI ||
      new URL("/auth/callback", window.location.origin).toString(),
    scope: import.meta.env.VITE_SSO_SCOPE || "openid",
    sessionEndpoint: import.meta.env.VITE_AUTH_SESSION_ENDPOINT || ""
  }
}

export function getMissingSsoConfig(config = getAuthConfig()) {
  const missing: string[] = []

  if (!config.authorizationUrl) missing.push("VITE_SSO_AUTHORIZATION_URL")
  if (!config.clientId) missing.push("VITE_SSO_CLIENT_ID")
  if (!config.redirectUri) missing.push("VITE_SSO_REDIRECT_URI")

  return missing
}
