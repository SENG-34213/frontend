import type { AuthSession } from "./authTypes";

const SESSION_KEY = "mentify_admin_auth_session";

function readJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isCurrentAccessToken(token: string) {
  const payload = readJwtPayload(token);
  if (!payload) return false;

  const audience = payload.aud;
  return Array.isArray(audience) ? audience.includes("mentify-api") : audience === "mentify-api";
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function saveSession(session: AuthSession) {
  if (canUseStorage()) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  const storedSession = window.sessionStorage.getItem(SESSION_KEY);
  if (!storedSession) return null;

  try {
    const session = JSON.parse(storedSession) as AuthSession;
    if (!session.accessToken || !isCurrentAccessToken(session.accessToken)) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getAccessToken() {
  return getSession()?.accessToken || null;
}

export function clearSession() {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}
