import { getAccessToken, getSession, saveSession } from "../auth/authStorage";
import type { ApiResponse, TokenRefreshResponse } from "../auth/authTypes";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    authenticated = true,
    retryOnUnauthorized = true,
    headers,
    ...requestInit
  } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => null);
  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const refreshed = await refreshStoredSession();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    const message =
      responseBody?.message ||
      responseBody?.error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, responseBody);
  }

  return responseBody as T;
}

export async function refreshStoredSession(): Promise<boolean> {
  const currentSession = getSession();
  if (!currentSession?.refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
  });

  const responseBody = (await response
    .json()
    .catch(() => null)) as ApiResponse<TokenRefreshResponse> | null;
  if (!response.ok || !responseBody?.data) return false;

  saveSession({
    ...currentSession,
    accessToken: responseBody.data.accessToken,
    refreshToken: responseBody.data.refreshToken,
    expiresAt: Date.now() + responseBody.data.expiresIn * 1000,
  });
  return true;
}
