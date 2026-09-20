import type { AuthSession, OAuthPendingState } from "./auth.types"

const pendingKeyPrefix = "ecalendar.oauth.pending."
const latestStateKey = "ecalendar.oauth.latest_state"
const sessionHintKey = "ecalendar.auth.session_hint"

export function savePendingOAuthState(pending: OAuthPendingState) {
  sessionStorage.setItem(`${pendingKeyPrefix}${pending.state}`, JSON.stringify(pending))
  sessionStorage.setItem(latestStateKey, pending.state)
}

export function readPendingOAuthState(state: string) {
  const raw = sessionStorage.getItem(`${pendingKeyPrefix}${state}`)
  if (!raw) return null

  try {
    return JSON.parse(raw) as OAuthPendingState
  } catch {
    return null
  }
}

export function clearPendingOAuthState(state?: string) {
  const resolvedState = state || sessionStorage.getItem(latestStateKey)
  if (resolvedState) sessionStorage.removeItem(`${pendingKeyPrefix}${resolvedState}`)
  sessionStorage.removeItem(latestStateKey)
}

export function saveSessionHint(session: AuthSession) {
  sessionStorage.setItem(
    sessionHintKey,
    JSON.stringify({
      authenticated: session.authenticated,
      user: session.user,
      storedAt: Date.now()
    })
  )
}

export function readSessionHint() {
  const raw = sessionStorage.getItem(sessionHintKey)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession & { storedAt?: number }
  } catch {
    return null
  }
}

export function clearSessionHint() {
  sessionStorage.removeItem(sessionHintKey)
}
