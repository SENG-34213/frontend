import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type MarketplaceCategory =
  | "NOTES"
  | "SHORT_NOTES"
  | "PAST_PAPER"
  | "EXAM_PAPER"
  | "MODEL_PAPER"
  | "WORKSHEET"
  | "QUESTION_BANK"
  | "MARKING_SCHEME"
  | "REVISION_PACK"
  | "STUDY_GUIDE"
  | "TUTORIAL"
  | "PRACTICE_PAPER"
  | "OTHER";
export type MarketplaceStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface MarketplaceProduct {
  id: string;
  materialId: string;
  thumbnailMaterialId?: string;
  materialOwnerId?: string;
  materialOwnerName?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category: MarketplaceCategory;
  subject?: string;
  courseDomain?: string;
  gradeId?: string;
  price: number;
  free: boolean;
  discountPercent?: number;
  finalPrice?: number;
  currency: string;
  status: MarketplaceStatus;
  thumbnailUrl?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketplaceProductRequest {
  materialId: string;
  thumbnailMaterialId?: string;
  materialOwnerId?: string;
  materialOwnerName?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category: MarketplaceCategory;
  subject?: string;
  courseDomain?: string;
  gradeId?: string;
  price: number;
  free: boolean;
  discountPercent?: number;
  currency: string;
  thumbnailUrl?: string;
  status?: MarketplaceStatus;
}

export interface MarketplacePage {
  content: MarketplaceProduct[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  "NOTES",
  "SHORT_NOTES",
  "PAST_PAPER",
  "EXAM_PAPER",
  "MODEL_PAPER",
  "WORKSHEET",
  "QUESTION_BANK",
  "MARKING_SCHEME",
  "REVISION_PACK",
  "STUDY_GUIDE",
  "TUTORIAL",
  "PRACTICE_PAPER",
  "OTHER",
];

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.data) throw new Error(response.message || "The marketplace returned no data.");
  return response.data;
}

export function getMarketplaceProducts(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}&size=50` : "?size=50";
  return apiRequest<ApiResponse<MarketplacePage>>(
    `/api/v1/marketplace/admin/products${query}`,
  ).then(unwrap);
}

export function createMarketplaceProduct(request: MarketplaceProductRequest) {
  return apiRequest<ApiResponse<MarketplaceProduct>>("/api/v1/marketplace/admin/products", {
    method: "POST",
    body: request,
  }).then(unwrap);
}

export function uploadMarketplaceMaterial(file: File, title: string, description?: string) {
  const body = new FormData();
  body.append("title", title);
  if (description) body.append("description", description);
  body.append("file", file);

  return apiRequest<ApiResponse<{ id: string }>>("/api/v1/materials/marketplace", {
    method: "POST",
    body,
  }).then(unwrap);
}

export function getMarketplaceMaterialDownloadUrl(materialId: string) {
  return apiRequest<ApiResponse<{ downloadUrl: string }>>(
    `/api/v1/materials/${materialId}/download`,
  )
    .then(unwrap)
    .then((material) => material.downloadUrl);
}

export function updateMarketplaceProduct(id: string, request: MarketplaceProductRequest) {
  return apiRequest<ApiResponse<MarketplaceProduct>>(`/api/v1/marketplace/admin/products/${id}`, {
    method: "PUT",
    body: request,
  }).then(unwrap);
}

export function updateMarketplaceStatus(id: string, status: MarketplaceStatus) {
  return apiRequest<ApiResponse<MarketplaceProduct>>(
    `/api/v1/marketplace/admin/products/${id}/status?status=${status}`,
    { method: "PATCH" },
  ).then(unwrap);
}

export function deleteMarketplaceProduct(id: string) {
  return apiRequest<ApiResponse<null>>(`/api/v1/marketplace/admin/products/${id}`, {
    method: "DELETE",
  }).then((response) => response);
}
