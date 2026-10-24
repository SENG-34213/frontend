import type { AuthSession } from "./authTypes";

const SESSION_KEY = "mentify_student_auth_session";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function saveSession(session: AuthSession) {
  if (!canUseStorage()) return;
  const serialized = JSON.stringify(session);
  if (session.rememberMe !== false) {
    window.localStorage.setItem(SESSION_KEY, serialized);
    window.sessionStorage.removeItem(SESSION_KEY);
  } else {
    window.sessionStorage.setItem(SESSION_KEY, serialized);
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  const persistentSession = window.localStorage.getItem(SESSION_KEY);
  const stored = persistentSession ?? window.sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as AuthSession;
    if (!persistentSession && session.rememberMe !== false) {
      session.rememberMe = true;
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    return session;
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
  if (canUseStorage()) window.localStorage.removeItem(SESSION_KEY);
}
