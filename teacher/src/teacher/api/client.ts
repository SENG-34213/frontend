import { clearSession, getAccessToken, getSession, saveSession } from "../auth/authStorage";
import type { ApiResponse, AuthSession, LoginResponse } from "../auth/authTypes";

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
  responseType?: "json" | "blob";
};

async function readResponse(response: Response, responseType: "json" | "blob" = "json") {
  if (responseType === "blob") return response.blob();
  return response.json().catch(() => null);
}

function safeErrorMessage(body: any, status: number): string {
  const raw = typeof body?.message === "string" ? body.message : typeof body?.error === "string" ? body.error : "";
  const technical = /entitymanager|hibernate|jdbc|sql|postgres|datasource|connection timed out|connecttimeout|timeout|exception|stack trace|org\.springframework|java\.|failed to execute/i.test(raw);
  if (status >= 500 || technical) {
    return status === 502 || status === 503 || status === 504
      ? "The service is temporarily unavailable. Please try again shortly."
      : "Something went wrong. Please try again later.";
  }
  return raw || `Request failed with status ${status}`;
}

async function refreshSession(): Promise<AuthSession | null> {
  const currentSession = getSession();
  if (!currentSession?.refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
  });
  const body = (await readResponse(response)) as ApiResponse<LoginResponse> | null;
  if (!response.ok || !body?.data?.accessToken) {
    clearSession();
    return null;
  }

  const nextSession: AuthSession = {
    ...currentSession,
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken ?? currentSession.refreshToken,
    expiresAt: Date.now() + body.data.expiresIn * 1000,
  };
  saveSession(nextSession);
  return nextSession;
}

export async function restoreTeacherSession() {
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
    responseType = "json",
    headers,
    ...requestInit
  } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (authenticated) {
    const accessToken = getAccessToken();
    if (accessToken) requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  const requestController = new AbortController();
  const callerSignal = requestInit.signal;
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, 30_000);
  const abortRequest = () => requestController.abort();

  if (callerSignal?.aborted) requestController.abort();
  else callerSignal?.addEventListener("abort", abortRequest, { once: true });

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers: requestHeaders,
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
      signal: requestController.signal,
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError("The service is taking too long to respond. Please try again shortly.", 504, error);
    }
    throw new ApiError("The service is temporarily unavailable. Please try again shortly.", 503, error);
  } finally {
    window.clearTimeout(timeoutId);
    callerSignal?.removeEventListener("abort", abortRequest);
  }
  const responseBody = await readResponse(response, responseType);

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const refreshedSession = await refreshSession();
    if (refreshedSession) return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
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
