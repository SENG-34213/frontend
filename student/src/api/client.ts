import { clearSession, getAccessToken, getSession, saveSession } from "../auth/authStorage";
import type { ApiResponse, AuthSession, LoginResponse } from "../auth/authTypes";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

function safeErrorMessage(body: unknown, status: number): string {
  const errorBody = body as { message?: unknown; error?: unknown } | null;
  const raw =
    typeof errorBody?.message === "string"
      ? errorBody.message
      : typeof errorBody?.error === "string"
        ? errorBody.error
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

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

let refreshSessionPromise: Promise<AuthSession | null> | null = null;

async function refreshSession(): Promise<AuthSession | null> {
  if (refreshSessionPromise) return refreshSessionPromise;
  refreshSessionPromise = refreshSessionInternal();
  try {
    return await refreshSessionPromise;
  } finally {
    refreshSessionPromise = null;
  }
}

async function refreshSessionInternal(): Promise<AuthSession | null> {
  const current = getSession();
  if (!current?.refreshToken) {
    expireStudentSession();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const body = (await readJson(response)) as ApiResponse<LoginResponse> | null;
  if (!response.ok || !body?.data?.accessToken) {
    expireStudentSession();
    return null;
  }

  const nextSession = {
    ...current,
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken ?? current.refreshToken,
    expiresAt: Date.now() + body.data.expiresIn * 1000,
  };
  saveSession(nextSession);
  return nextSession;
}

function expireStudentSession() {
  clearSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("student:session-expired"));
  }
}

export async function restoreStudentSession() {
  const session = getSession();
  if (!session) return null;
  if (session.expiresAt > Date.now() + 10_000) return session;
  return refreshSession();
}

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
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (authenticated) {
    const accessToken = getAccessToken();
    if (accessToken) requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(
      "The service is temporarily unavailable. Please try again shortly.",
      503,
      error,
    );
  }
  const responseBody = await readJson(response);

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    if (await refreshSession())
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (!response.ok) {
    const message = safeErrorMessage(responseBody, response.status);
    throw new ApiError(message, response.status, responseBody);
  }
  return responseBody as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  retryOnUnauthorized = true,
): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  const body = await readJson(response);
  if (response.status === 401 && retryOnUnauthorized && (await refreshSession())) {
    return apiUpload<T>(path, formData, false);
  }
  if (!response.ok)
    throw new ApiError(
      body?.message || `Request failed with status ${response.status}`,
      response.status,
      body,
    );
  return body as T;
}

export async function apiBlob(path: string, retryOnUnauthorized = true): Promise<Blob> {
  const accessToken = getAccessToken();
  const headers = new Headers({ Accept: "image/*" });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (response.status === 401 && retryOnUnauthorized && (await refreshSession())) {
    return apiBlob(path, false);
  }
  if (!response.ok) {
    const body = await readJson(response);
    throw new ApiError(safeErrorMessage(body, response.status), response.status, body);
  }
  return response.blob();
}
