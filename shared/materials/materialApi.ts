import type { Material, MaterialApi, MaterialDownloadResponse, MaterialListResponse, MaterialUploadDraft } from "./materialTypes";

type ApiEnvelope<T> = { data?: T; message?: string; error?: string };

function read<T>(payload: ApiEnvelope<T> | T): T {
  return payload && typeof payload === "object" && "data" in payload && payload.data !== undefined ? payload.data as T : payload as T;
}

function getBaseUrl(configuredBaseUrl?: string) {
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") return (sessionStorage.getItem("mentify_api_url") || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
  return (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
}

function token() { return typeof window === "undefined" ? "" : sessionStorage.getItem("mentify_access_token") || ""; }

async function request<T>(baseUrl: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...(init.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `Material service request failed (${response.status}).`);
  return read<T>(payload);
}

function normalizeList(payload: MaterialListResponse) {
  if (Array.isArray(payload)) return payload;
  return payload.content || payload.items || payload.data || [];
}

function uploadWithProgress(baseUrl: string, file: File, draft: MaterialUploadDraft, onProgress?: (progress: number) => void) {
  return new Promise<Material>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/api/v1/materials`);
    if (token()) xhr.setRequestHeader("Authorization", `Bearer ${token()}`);
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100)); };
    xhr.onerror = () => reject(new Error("The material upload could not reach the service."));
    xhr.onload = () => {
      const payload = JSON.parse(xhr.responseText || "{}");
      if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(payload.message || payload.error || `Material upload failed (${xhr.status}).`)); return; }
      resolve(read<Material>(payload));
    };
    const body = new FormData();
    body.append("file", file);
    Object.entries(draft).forEach(([key, value]) => { if (value) body.append(key, value); });
    xhr.send(body);
  });
}

export function createMaterialApi(configuredBaseUrl?: string): MaterialApi {
  const baseUrl = getBaseUrl(configuredBaseUrl);
  return {
    list: async (filters = {}) => {
      const params = new URLSearchParams({ size: "50" });
      Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
      return normalizeList(await request<MaterialListResponse>(baseUrl, `/api/v1/materials?${params.toString()}`));
    },
    upload: (file, draft, onProgress) => uploadWithProgress(baseUrl, file, draft, onProgress),
    download: (materialId) => request<MaterialDownloadResponse>(baseUrl, `/api/v1/materials/${encodeURIComponent(materialId)}/download`),
  };
}

export type { Material, MaterialApi, MaterialDownloadResponse, MaterialListResponse, MaterialUploadDraft } from "./materialTypes";
