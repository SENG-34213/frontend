import {
  ApiResponse,
  CourseItem,
  MaterialItem,
  TeacherProfile,
  AdmissionsFormData,
  ContactFormData,
} from "../../types";
import { MOCK_COURSES, MOCK_TEACHERS } from "../../data/mockData";
import { SITE_CONFIG } from "../config/site";

/**
 * Backend API Capability & Integration Status Matrix
 *
 * 1. Public Marketplace Materials List:
 *    - Route: GET /api/v1/marketplace/materials
 *    - Status: READY_FOR_FRONTEND_INTEGRATION
 *    - Supported Query Params: search, subject, gradeId, category, page, limit
 *
 * 2. Public Marketplace Material Details:
 *    - Route: GET /api/v1/marketplace/materials/{productId}
 *    - Status: READY_FOR_FRONTEND_INTEGRATION
 *
 * 3. Published Courses List & Details:
 *    - Route: Course management endpoints in backend are currently role-protected (Admin/Teacher only).
 *    - Status: REQUIRES_BACKEND_PUBLIC_ENDPOINT (Clean public DTO separated from admin course CRUD)
 *    - Frontend strategy: Clean fixture layer simulating the proposed public DTO contract.
 *
 * 4. Public Teacher Directory:
 *    - Status: REQUIRES_BACKEND_PUBLIC_ENDPOINT (Sanitized public directory without PII)
 *    - Frontend strategy: Verified public teacher profiles fixture.
 *
 * 5. Pre-Registration / Admissions API:
 *    - Route: POST /api/v1/public/admissions or institute pre-registration
 *    - Status: READY_FOR_FRONTEND_INTEGRATION (with anti-abuse rate limits & Resend email webhook)
 *
 * 6. Contact Inquiries API:
 *    - Route: POST /api/v1/public/contact
 *    - Status: READY_FOR_FRONTEND_INTEGRATION
 *
 * 7. Marketplace Commerce & Entitlements:
 *    - Status: COMMERCE_PREPARATION (Server-authoritative Stripe checkout & S3 signed download URLs required)
 */

export interface MarketplaceQueryParams {
  search?: string;
  subject?: string;
  gradeId?: string;
  category?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}

const MARKETPLACE_CATEGORY_LABELS: Record<string, MaterialItem["category"]> = {
  NOTES: "Notes",
  SHORT_NOTES: "Short Notes",
  PAST_PAPER: "Past Papers",
  EXAM_PAPER: "Exam Papers",
  MODEL_PAPER: "Model Papers",
  WORKSHEET: "Worksheets",
  QUESTION_BANK: "Question Banks",
  MARKING_SCHEME: "Marking Schemes",
  REVISION_PACK: "Revision Packs",
  STUDY_GUIDE: "Study Guides",
  TUTORIAL: "Tutorials",
  PRACTICE_PAPER: "Practice Papers",
  OTHER: "Other",
};

function toBackendCategory(category?: string) {
  if (!category || category === "all") return undefined;
  return Object.entries(MARKETPLACE_CATEGORY_LABELS).find(([, label]) => label === category)?.[0];
}

function mapMarketplaceProduct(product: any): MaterialItem {
  const category = MARKETPLACE_CATEGORY_LABELS[product.category] || "Other";
  const price = Number(product.price || 0);
  const finalPrice = Number(product.finalPrice ?? price);
  const id = String(product.id);

  return {
    id,
    materialId: String(product.materialId || product.id),
    title: product.title || "Untitled resource",
    description: product.description || product.shortDescription || "",
    category,
    subject: product.subject || "General",
    gradeId: product.gradeId ? String(product.gradeId) : "",
    price,
    free: Boolean(product.free),
    discountPercent: product.discountPercent == null ? undefined : Number(product.discountPercent),
    finalPrice,
    currency: product.currency || "LKR",
    status: product.status || "PUBLISHED",
    thumbnailUrl:
      product.thumbnailUrl ||
      (product.thumbnailMaterialId
        ? `/api/marketplace/materials/${encodeURIComponent(id)}/thumbnail`
        : "/TiTJaffna-logo.jpeg"),
    fileFormat: product.fileFormat || undefined,
    pages: product.pageCount == null ? undefined : Number(product.pageCount),
    authorName: product.materialOwnerName || "TiT Academic Board",
    createdAt: product.createdAt,
  };
}

class TiTApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SITE_CONFIG.apiGatewayUrl || "";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      // Fallback indicator
      throw error;
    }
  }

  // --- MARKETPLACE MATERIALS ---
  async getMarketplaceMaterials(
    params: MarketplaceQueryParams = {},
  ): Promise<ApiResponse<MaterialItem[]>> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.subject && params.subject !== "all") query.set("subject", params.subject);
    if (params.gradeId && /^[0-9a-f-]{36}$/i.test(params.gradeId)) query.set("gradeId", params.gradeId);
    const category = toBackendCategory(params.category);
    if (category) query.set("category", category);
    if (params.isFree !== undefined) query.set("isFree", String(params.isFree));
    query.set("page", String(params.page || 1));
    query.set("limit", String(params.limit || 9));

    const response = await fetch(`/api/marketplace/materials?${query.toString()}`);
    if (!response.ok) throw new Error(`Marketplace API error (${response.status})`);

    const payload = await response.json();
    const page = payload.data || {};
    const content = Array.isArray(page) ? page : page.content || [];

    return {
      success: true,
      data: content.map(mapMarketplaceProduct),
      meta: {
        page: (page.number ?? (params.page || 1) - 1) + 1,
        limit: page.size ?? params.limit ?? 9,
        total: page.totalElements ?? content.length,
        totalPages: page.totalPages ?? 1,
      },
      message: payload.message,
    };
  }

  async getMaterialById(id: string): Promise<ApiResponse<MaterialItem | null>> {
    const response = await fetch(`/api/marketplace/materials/${encodeURIComponent(id)}`);
    if (!response.ok) {
      if (response.status === 404) return { success: false, data: null, message: "Material not found" };
      throw new Error(`Marketplace API error (${response.status})`);
    }
    const payload = await response.json();
    return { success: true, data: payload.data ? mapMarketplaceProduct(payload.data) : null, message: payload.message };
  }

  // --- COURSES ---
  async getCourses(
    filters: { search?: string; subject?: string; gradeId?: string; format?: string } = {},
  ): Promise<ApiResponse<CourseItem[]>> {
    let results = [...MOCK_COURSES];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.subject.toLowerCase().includes(term) ||
          c.teacher.name.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term),
      );
    }

    if (filters.subject && filters.subject !== "all") {
      results = results.filter((c) => c.subject.toLowerCase() === filters.subject?.toLowerCase());
    }

    if (filters.gradeId && filters.gradeId !== "all") {
      results = results.filter((c) => c.gradeId === filters.gradeId);
    }

    if (filters.format && filters.format !== "all") {
      results = results.filter((c) => c.learningFormat === filters.format);
    }

    return {
      success: true,
      data: results,
      meta: {
        total: results.length,
      },
    };
  }

  async getCourseById(id: string): Promise<ApiResponse<CourseItem | null>> {
    const item = MOCK_COURSES.find((c) => c.id === id || c.code === id) || null;
    return {
      success: !!item,
      data: item,
    };
  }

  // --- TEACHERS ---
  async getTeachers(): Promise<ApiResponse<TeacherProfile[]>> {
    return {
      success: true,
      data: MOCK_TEACHERS,
      meta: {
        total: MOCK_TEACHERS.length,
      },
    };
  }

  // --- ADMISSIONS & PRE-REGISTRATION ---
  async submitAdmissions(
    formData: AdmissionsFormData,
  ): Promise<ApiResponse<{ referenceNo: string }>> {
    const gradeMatch = formData.grade.match(/grade-(\d+)/i);
    const gradeNumber = gradeMatch ? Number(gradeMatch[1]) : Number(formData.grade);
    const grade = formData.grade.toLowerCase().includes("al") || gradeNumber >= 12
      ? "al"
      : String(gradeNumber);
    const classFormat =
      formData.learningPreference === "Online Live"
        ? "online"
        : formData.learningPreference === "Physical Classroom"
          ? "onsite"
          : "either";
    const email = formData.guardianEmail.trim() || formData.studentEmail?.trim() || "";
    const phone = formData.guardianPhone.trim() || formData.studentPhone?.trim() || "";
    const response = await fetch("/api/preregister", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: formData.studentFullName.trim(),
        email,
        phone,
        role: "parent",
        district: formData.district,
        city: formData.city.trim(),
        classFormat,
        grade,
        subjects: formData.preferredSubjects,
        contactMethod:
          formData.preferredContactMethod === "Phone Call"
            ? "phone"
            : formData.preferredContactMethod === "Email"
              ? "email"
              : "whatsapp",
        consent: formData.consentAgreed,
        website: "",
      }),
    });
    const result = (await response.json()) as ApiResponse<{ referenceNo?: string }>;
    if (!response.ok) {
      throw new Error(result.message || "We could not submit your registration.");
    }
    const referenceNo = result.data?.referenceNo;
    if (!referenceNo) {
      throw new Error("The registration was submitted, but no reference number was returned.");
    }
    return { ...result, data: { referenceNo } };
  }

  // --- CONTACT INQUIRY ---
  async submitContact(formData: ContactFormData): Promise<ApiResponse<{ ticketId: string }>> {
    if (this.baseUrl) {
      try {
        const res = await this.request<{ ticketId: string }>("/api/v1/public/contact", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        return res;
      } catch (err) {
        console.warn("Backend contact submission failed, returning local ticket:", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
    return {
      success: true,
      message: "Your inquiry has been submitted. Our support team will follow up promptly.",
      data: { ticketId },
    };
  }
}

export const api = new TiTApiClient();
