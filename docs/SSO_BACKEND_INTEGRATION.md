# Signet SSO Backend Integration

This document separates the frontend work implemented in this repository from
the backend work required to complete the Signet SSO flow.

## Source Of Truth Checked

The live Swagger document was inspected on September 20, 2026:

`https://unsisterly-sanjuana-spondaic.ngrok-free.dev/swagger/doc.json`

It describes a Swagger 2.0 API with `basePath: /api/v1`, host
`localhost:8080`, and Calendar/Event endpoints. It does not expose an SSO
callback endpoint, session endpoint, logout endpoint, or refresh endpoint.

## Implemented In Frontend

- PKCE `code_verifier` generation with `crypto.getRandomValues`.
- PKCE `code_challenge` generation with SHA-256 and Base64URL encoding.
- Cryptographically random OAuth `state` and `nonce`.
- Temporary OAuth state storage in `sessionStorage`.
- `/auth/login` route that builds the Signet authorization URL from public
  environment configuration.
- `/auth/callback` route that validates `state`, retrieves the verifier, and
  sends the authorization code to the configurable backend callback endpoint.
- OAuth query cleanup with `history.replaceState`.
- Centralized Axios client with configurable API base URL and cookie support.
- Centralized `401 Unauthorized` handling that clears the frontend session hint
  and returns the app to the login flow when SSO is enabled.
- No confidential SSO secret or access token exchange is implemented in the
  browser.
- Existing Calendar/Event services use the centralized Axios client.

## Required On Backend

### 1. SSO callback endpoint

Expose the endpoint configured by `VITE_BACKEND_SSO_CALLBACK_ENDPOINT`, for
example:

```http
POST /api/v1/auth/sso/callback
Content-Type: application/json
```

Request:

```json
{
  "code": "<authorization-code>",
  "codeVerifier": "<pkce-code-verifier>",
  "redirectUri": "<exact-frontend-redirect-uri>"
}
```

The backend must:

1. Validate the request and the configured redirect URI.
2. Exchange the authorization code with Signet using the server-side
   confidential credential and the received PKCE verifier.
3. Call Signet user-info with the returned access token.
4. Find or create/map the local user.
5. Establish the application session used by Calendar/Event requests.
6. Return a frontend-safe response, for example:

```json
{
  "authenticated": true,
  "user": {
    "id": "local-user-id",
    "name": "Display name",
    "email": "user@example.com"
  }
}
```

The confidential credential must be read only from backend configuration. It
must not be returned in the response or accepted from the frontend.

### 2. Session-check endpoint

Expose a session-check endpoint and configure it with
`VITE_AUTH_SESSION_ENDPOINT`, for example:

```http
GET /api/v1/auth/session
```

Expected successful response:

```json
{
  "authenticated": true,
  "user": {
    "id": "local-user-id",
    "name": "Display name",
    "email": "user@example.com"
  }
}
```

Return `401 Unauthorized` when there is no valid application session.

### 3. Cookie and CORS settings

If the backend uses an HttpOnly cookie session:

- Set `HttpOnly`.
- Set `Secure` in HTTPS environments.
- Choose `SameSite` according to the MiniApp deployment topology.
- Allow the exact frontend origin in CORS.
- Allow credentials.
- Do not use wildcard origins with credentialed requests.

The frontend sends `withCredentials: true` by default. Set
`VITE_API_WITH_CREDENTIALS=false` only if the backend contract explicitly does
not use cookies.

### 4. Refresh and logout

The backend owns token refresh and Signet token storage. The frontend should
not call the Signet token endpoint directly. Provide application endpoints
for logout and, if needed, session recovery rather than exposing provider
tokens to the browser.

## Existing API Contract

The live Swagger document confirms these Calendar/Event routes under
`/api/v1`:

```text
GET    /calendars
POST   /calendars
PATCH  /calendars/{id}
DELETE /api/v1/calendars/{id}

GET    /events
POST   /events
PATCH  /events/{id}
DELETE /events/{id}
```

The frontend keeps the backend's `calendarID` event query parameter and uses
the Swagger `event.EventListItem` shape for event list mapping.

## Not Verified

- The actual Signet authorization URL.
- The final backend SSO callback path.
- The backend session-check path.
- Cookie name, domain, SameSite policy, and expiry.
- Backend logout and refresh route names.

These values must be supplied by the backend/Signet deployment before
production SSO is enabled.
