import { apiClient } from "@/api/axios";
import {
  clearPendingOAuthState,
  readPendingOAuthState,
  savePendingOAuthState,
  saveSessionHint,
} from "./auth.storage";
import { getAuthConfig, getMissingSsoConfig } from "./auth.config";
import {
  generateCodeChallenge,
  generateRandomString,
  generateNonce,
  generateRandomState,
} from "./pkce";
import type { AuthSession, SsoCallbackRequest } from "./auth.types";

export async function buildAuthorizationUrl() {
  const config = getAuthConfig();
  const missing = getMissingSsoConfig(config);

  if (missing.length > 0) {
    throw new Error(`Missing SSO configuration: ${missing.join(", ")}`);
  }

  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomState();
  const nonce = generateNonce();

  savePendingOAuthState({
    codeVerifier,
    nonce,
    redirectUri: config.redirectUri,
    state,
    createdAt: Date.now(),
  });

  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("response_mode", "query");

  return url.toString();
}

export async function exchangeAuthorizationCode(payload: SsoCallbackRequest) {
  const config = getAuthConfig();

  const response = await apiClient.post<AuthSession>(
    config.backendCallbackEndpoint,
    {
      code: payload.code,
      code_verifier: payload.codeVerifier,
      redirect_uri: payload.redirectUri,
    },
  );

  const session =
    response.data?.authenticated === false
      ? response.data
      : { ...response.data, authenticated: true };

  saveSessionHint(session);

  return session;
}

export async function checkBackendSession() {
  const config = getAuthConfig();
  if (!config.authEnabled) return { authenticated: true } satisfies AuthSession;
  if (!config.sessionEndpoint) return null;

  const response = await apiClient.get<AuthSession>(config.sessionEndpoint);
  return response.data;
}
export function resolveOAuthCallback(search: string) {
  const params = new URLSearchParams(search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  if (error) {
    throw new Error(errorDescription || error);
  }

  if (!code) {
    throw new Error("Missing authorization code in callback URL.");
  }

  if (!state) {
    throw new Error("Missing OAuth state in callback URL.");
  }

  const pending = readPendingOAuthState(state);
  if (!pending || pending.state !== state) {
    throw new Error("Invalid OAuth state. Please restart sign-in.");
  }

  clearPendingOAuthState(state);

  return {
    code,
    codeVerifier: pending.codeVerifier,
    redirectUri: pending.redirectUri,
  };
}
