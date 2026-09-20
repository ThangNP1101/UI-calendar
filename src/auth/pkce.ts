const codeVerifierCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"

function base64UrlEncode(bytes: Uint8Array) {
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "")
}

export function generateCodeVerifier(length = 64) {
  const randomBytes = new Uint8Array(length)
  crypto.getRandomValues(randomBytes)

  return Array.from(randomBytes, (byte) => codeVerifierCharacters[byte % codeVerifierCharacters.length]).join("")
}

export async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(new Uint8Array(digest))
}

export function generateRandomState() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

export function generateNonce() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}
