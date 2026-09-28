/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_ENABLED?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_WITH_CREDENTIALS?: string
  readonly VITE_SSO_CLIENT_ID?: string
  readonly VITE_SSO_REDIRECT_URI?: string
  readonly VITE_SSO_AUTHORIZATION_URL?: string
  readonly VITE_SSO_SCOPE?: string
  readonly VITE_BACKEND_SSO_CALLBACK_ENDPOINT?: string
  readonly VITE_AUTH_SESSION_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
