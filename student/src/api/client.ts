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

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

async function refreshSession(): Promise<AuthSession | null> {
  const current = getSession();
  if (!current?.refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const body = (await readJson(response)) as ApiResponse<LoginResponse> | null;
  if (!response.ok || !body?.data?.accessToken) {
    clearSession();
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const responseBody = await readJson(response);

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    if (await refreshSession())
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
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

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  const body = await readJson(response);
  if (!response.ok)
    throw new ApiError(
      body?.message || `Request failed with status ${response.status}`,
      response.status,
      body,
    );
  return body as T;
}
