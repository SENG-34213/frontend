import type { AuthSession } from "./authTypes";

const SESSION_KEY = "mentify_student_auth_session";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function saveSession(session: AuthSession) {
  if (canUseStorage()) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  const stored = window.sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthSession;
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
