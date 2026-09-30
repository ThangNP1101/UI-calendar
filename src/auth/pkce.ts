const codeVerifierCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function generateRandomString(length: number) {
  let randomString = "";
  const cryptoObj = window.crypto;

  if (cryptoObj?.getRandomValues) {
    const randomValues = new Uint8Array(length);
    cryptoObj.getRandomValues(randomValues);

    randomString = Array.from(randomValues)
      .map(
        (value) =>
          codeVerifierCharacters[value % codeVerifierCharacters.length],
      )
      .join("");
  } else {
    while (randomString.length < length) {
      randomString += codeVerifierCharacters.charAt(
        Math.floor(Math.random() * codeVerifierCharacters.length),
      );
    }
  }

  return randomString;
}

export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateRandomState() {
  return generateRandomString(43);
}

export function generateNonce() {
  return generateRandomString(43);
}
