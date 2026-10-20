import { getAccessToken, getSession, saveSession } from "../auth/authStorage";
import type { ApiResponse, TokenRefreshResponse } from "../auth/authTypes";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

let refreshPromise: Promise<boolean> | null = null;

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

  if (authenticated && retryOnUnauthorized) {
    const session = getSession();
    if (session && session.expiresAt <= Date.now() + 10_000) {
      const refreshed = await refreshStoredSession();
      if (!refreshed) {
        throw new ApiError("Your session has expired. Please sign in again.", 401);
      }
    }
  }

  const requestHeaders = new Headers(headers);
  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;

  requestHeaders.set("Accept", "application/json");
  if (body !== undefined && !isFormDataBody) {
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
    body: body === undefined ? undefined : isFormDataBody ? body : JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => null);
  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const refreshed = await refreshStoredSession();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }

    throw new ApiError("Your session has expired. Please sign in again.", 401, responseBody);
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
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshStoredSessionInternal();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function refreshStoredSessionInternal(): Promise<boolean> {
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
