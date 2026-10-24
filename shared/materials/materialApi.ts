import type {
  Material,
  MaterialApi,
  MaterialDownloadResponse,
  MaterialListResponse,
  MaterialUploadDraft,
} from "./materialTypes";

type ApiEnvelope<T> = { data?: T; message?: string; error?: string };

function safeErrorMessage(payload: ApiEnvelope<unknown>, status: number) {
  const raw =
    typeof payload?.message === "string"
      ? payload.message
      : typeof payload?.error === "string"
        ? payload.error
        : "";
  if (
    status >= 500 ||
    /entitymanager|hibernate|jdbc|sql|postgres|datasource|timeout|exception|stack trace|org\.springframework|java\./i.test(
      raw,
    )
  ) {
    return status === 502 || status === 503 || status === 504
      ? "The service is temporarily unavailable. Please try again shortly."
      : "Something went wrong. Please try again later.";
  }
  return raw || `Material service request failed (${status}).`;
}

function read<T>(payload: ApiEnvelope<T> | T): T {
  return payload && typeof payload === "object" && "data" in payload && payload.data !== undefined
    ? (payload.data as T)
    : (payload as T);
}

function getBaseUrl(configuredBaseUrl?: string) {
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/$/, "");
  if (typeof window !== "undefined")
    return (
      sessionStorage.getItem("mentify_api_url") ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080"
    ).replace(/\/$/, "");
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

function token() {
  if (typeof window === "undefined") return "";

  // Each portal keeps its session as a JSON object. The old standalone key is
  // still supported for compatibility with the shared materials workspace.
  for (const key of [
    "mentify_admin_auth_session",
    "mentify_teacher_auth_session",
    "mentify_student_auth_session",
  ]) {
    const stored = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!stored) continue;
    try {
      const accessToken = (JSON.parse(stored) as { accessToken?: string }).accessToken;
      if (accessToken) return accessToken;
    } catch {
      // Ignore malformed portal sessions and check the next supported session key.
    }
  }

  return sessionStorage.getItem("mentify_access_token") || "";
}

async function request<T>(baseUrl: string, path: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new Error("The service is temporarily unavailable. Please try again shortly.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(safeErrorMessage(payload, response.status));
  return read<T>(payload);
}

function normalizeList(payload: MaterialListResponse) {
  if (Array.isArray(payload)) return payload;
  return payload.content || payload.items || payload.data || [];
}

function uploadWithProgress(
  baseUrl: string,
  file: File,
  draft: MaterialUploadDraft,
  onProgress?: (progress: number) => void,
) {
  return new Promise<Material>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/api/v1/materials`);
    if (token()) xhr.setRequestHeader("Authorization", `Bearer ${token()}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("The material upload could not reach the service."));
    xhr.onload = () => {
      const payload = JSON.parse(xhr.responseText || "{}");
      if (xhr.status < 200 || xhr.status >= 300) {
        const serverMessage = String(payload.message || payload.error || "");
        if (
          xhr.status === 413 ||
          /maximum upload size|maxuploadsize|request entity too large|payload too large/i.test(
            serverMessage,
          )
        ) {
          reject(new Error("Image is too large. Please choose an image smaller than 5 MB."));
          return;
        }
        reject(new Error(safeErrorMessage(payload, xhr.status)));
        return;
      }
      resolve(read<Material>(payload));
    };
    const body = new FormData();
    body.append("file", file);
    Object.entries(draft).forEach(([key, value]) => {
      if (value) body.append(key, value);
    });
    xhr.send(body);
  });
}

export function createMaterialApi(configuredBaseUrl?: string): MaterialApi {
  const baseUrl = getBaseUrl(configuredBaseUrl);
  return {
    list: async (filters = {}) => {
      const params = new URLSearchParams({
        size: String(filters.size || 50),
        page: String(filters.page || 0),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
      });
      return normalizeList(
        await request<MaterialListResponse>(baseUrl, `/api/v1/materials?${params.toString()}`),
      );
    },
    upload: (file, draft, onProgress) => uploadWithProgress(baseUrl, file, draft, onProgress),
    download: (materialId) =>
      request<MaterialDownloadResponse>(
        baseUrl,
        `/api/v1/materials/${encodeURIComponent(materialId)}/download`,
      ),
    update: (materialId, patch) =>
      request<Material>(baseUrl, `/api/v1/materials/${encodeURIComponent(materialId)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    archive: (materialId) =>
      request<Material>(baseUrl, `/api/v1/materials/${encodeURIComponent(materialId)}/archive`, {
        method: "POST",
      }),
    remove: async (materialId) => {
      await request<unknown>(baseUrl, `/api/v1/materials/${encodeURIComponent(materialId)}`, {
        method: "DELETE",
      });
    },
    attach: (materialId, target) =>
      request<Material>(
        baseUrl,
        `/api/v1/materials/${encodeURIComponent(materialId)}/attachments`,
        { method: "POST", body: JSON.stringify(target) },
      ),
  };
}

export type {
  Material,
  MaterialApi,
  MaterialDownloadResponse,
  MaterialListResponse,
  MaterialUploadDraft,
} from "./materialTypes";
