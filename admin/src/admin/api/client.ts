import { clearSession, getAccessToken, getSession, saveSession } from "../auth/authStorage";
import type { ApiResponse, TokenRefreshResponse } from "../auth/authTypes";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalizedPath.replace(/^\/api(?=\/|$)/, "");
  return `${API_BASE_URL}${API_BASE_URL.endsWith("/api") ? apiPath : normalizedPath}`;
}

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
  responseType?: "json" | "blob";
};

function safeErrorMessage(body: any, status: number): string {
  const raw =
    typeof body?.message === "string"
      ? body.message
      : typeof body?.error === "string"
        ? body.error
        : "";
  const technical =
    /entitymanager|hibernate|jdbc|sql|postgres|datasource|connection timed out|connecttimeout|timeout|exception|stack trace|org\.springframework|java\.|failed to execute/i.test(
      raw,
    );
  if (status >= 500 || technical) {
    return status === 502 || status === 503 || status === 504
      ? "The service is temporarily unavailable. Please try again shortly."
      : "Something went wrong. Please try again later.";
  }
  return raw || `Request failed with status ${status}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    authenticated = true,
    retryOnUnauthorized = true,
    responseType = "json",
    headers,
    ...requestInit
  } = options;

  if (authenticated && retryOnUnauthorized) {
    const session = getSession();
    if (!session) {
      expireAdminSession();
      throw new ApiError("Your session is no longer valid. Please sign in again.", 401);
    }
    if (session && session.expiresAt <= Date.now() + 10_000) {
      const refreshed = await refreshStoredSession();
      if (!refreshed) {
        expireAdminSession();
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

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...requestInit,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormDataBody ? body : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(
      "The service is temporarily unavailable. Please try again shortly.",
      503,
      error,
    );
  }

  const responseBody =
    responseType === "blob" ? await response.blob() : await response.json().catch(() => null);
  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const refreshed = await refreshStoredSession();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }

    expireAdminSession();
    throw new ApiError("Your session has expired. Please sign in again.", 401, responseBody);
  }

  if (!response.ok) {
    const message = safeErrorMessage(responseBody, response.status);
    throw new ApiError(message, response.status, responseBody);
  }

  return responseBody as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  return apiRequest<Blob>(path, { responseType: "blob" });
}

function expireAdminSession() {
  clearSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mentify:auth-expired"));
  }
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

  const response = await fetch(apiUrl("/api/v1/auth/refresh"), {
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
