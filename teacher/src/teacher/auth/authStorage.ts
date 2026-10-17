import type { AuthSession } from "./authTypes";

const SESSION_KEY = "mentify_teacher_auth_session";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function saveSession(session: AuthSession) {
  if (canUseStorage()) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  const storedSession = window.sessionStorage.getItem(SESSION_KEY);
  if (!storedSession) return null;

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null;
}

export function clearSession() {
  if (canUseStorage()) window.sessionStorage.removeItem(SESSION_KEY);
}
