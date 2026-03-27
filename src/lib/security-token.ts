export const WON_SECURITY_TOKEN_STORAGE_KEY = "won_security_token";
export const WON_SECURITY_TOKEN_COOKIE = "won_security_token_once";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

function clearCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function storeOneTimeSecurityToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WON_SECURITY_TOKEN_STORAGE_KEY, token);
}

export function readOneTimeSecurityToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionToken = sessionStorage.getItem(WON_SECURITY_TOKEN_STORAGE_KEY);
  if (sessionToken) {
    return sessionToken;
  }

  const cookieToken = readCookie(WON_SECURITY_TOKEN_COOKIE);
  if (!cookieToken) {
    return null;
  }

  sessionStorage.setItem(WON_SECURITY_TOKEN_STORAGE_KEY, cookieToken);
  clearCookie(WON_SECURITY_TOKEN_COOKIE);
  return cookieToken;
}

export function clearOneTimeSecurityToken() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(WON_SECURITY_TOKEN_STORAGE_KEY);
  }

  clearCookie(WON_SECURITY_TOKEN_COOKIE);
}
