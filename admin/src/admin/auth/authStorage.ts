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
    const serialized = JSON.stringify(session);
    if (session.rememberMe !== false) {
      window.localStorage.setItem(SESSION_KEY, serialized);
      window.sessionStorage.removeItem(SESSION_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_KEY, serialized);
      window.localStorage.removeItem(SESSION_KEY);
    }
  }
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  const persistentSession = window.localStorage.getItem(SESSION_KEY);
  const storedSession = persistentSession ?? window.sessionStorage.getItem(SESSION_KEY);
  if (!storedSession) return null;

  try {
    const session = JSON.parse(storedSession) as AuthSession;
    if (!persistentSession && session.rememberMe !== false) {
      session.rememberMe = true;
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    if (!session.accessToken || !isCurrentAccessToken(session.accessToken)) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function getAccessToken() {
  return getSession()?.accessToken || null;
}

export function clearSession() {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  }
}
