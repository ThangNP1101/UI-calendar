export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "authentication_error";

export type AuthSession = {
  authenticated: boolean;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

export type OAuthPendingState = {
  codeVerifier: string;
  nonce: string;
  redirectUri: string;
  state: string;
  createdAt: number;
};

export type SsoCallbackRequest = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

export type AuthConfig = {
  authEnabled: boolean;
  authorizationUrl: string;
  backendCallbackEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  sessionEndpoint: string;
};
