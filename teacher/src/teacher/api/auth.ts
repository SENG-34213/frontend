export type ApiResponse<T> = {
  statusCode?: number;
  message?: string;
  data?: T;
};

export type AuthenticatedUser = {
  id?: string;
  keycloakUserId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  scope?: string;
  issuedAt?: string;
  user?: AuthenticatedUser;
};

type BackendError = { message?: string; error?: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const ACCESS_TOKEN_KEY = "mentify.teacher.accessToken";
const REFRESH_TOKEN_KEY = "mentify.teacher.refreshToken";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as T & BackendError;
  if (!response.ok) {
    throw new Error(body?.message || body?.error || `Request failed (${response.status})`);
  }
  return body;
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function clearAuthSession() {
  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(REFRESH_TOKEN_KEY);
}

export async function login(identifier: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const envelope = await parseResponse<ApiResponse<LoginResponse>>(response);
  const data = envelope.data;
  if (!data?.accessToken) throw new Error("The login response did not include an access token.");

  const storage = getStorage();
  storage?.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  if (data.refreshToken) storage?.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return data;
}

export async function getCurrentUser() {
  const token = getAccessToken();
  if (!token) throw new Error("No active teacher session.");
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const envelope = await parseResponse<ApiResponse<AuthenticatedUser>>(response);
  return envelope.data;
}

export async function logout() {
  const storage = getStorage();
  const refreshToken = storage?.getItem(REFRESH_TOKEN_KEY);
  try {
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    clearAuthSession();
  }
}
