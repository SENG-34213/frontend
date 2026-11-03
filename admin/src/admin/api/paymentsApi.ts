import { apiRequest } from "./client";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type PaymentType = "COURSE" | "MARKETPLACE";

export interface AdminPayment {
  paymentId: string;
  studentId?: string | null;
  buyerName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  paymentType?: PaymentType;
  marketplaceProductId?: string | null;
  productName?: string | null;
  courseId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  createdAt?: string | null;
}

export interface AdminPaymentPage {
  content: AdminPayment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PaymentAnalyticsOverview {
  revenue: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
}

export function getAdminPayments(status?: PaymentStatus) {
  const query = new URLSearchParams({ page: "0", size: "100", sort: "createdAt,desc" });
  if (status) query.set("status", status);
  return apiRequest<{ data: AdminPaymentPage; message?: string }>(
    `/api/v1/payments/admin?${query.toString()}`,
  ).then((response) => response.data);
}

export function getAdminPaymentOverview() {
  return apiRequest<{ data: PaymentAnalyticsOverview; message?: string }>(
    "/api/v1/payments/admin/overview",
  ).then((response) => response.data);
}

export function syncMarketplacePayment(paymentId: string) {
  return apiRequest<{ data: { status: PaymentStatus }; message?: string }>(
    `/api/v1/payments/marketplace/${paymentId}/sync`,
    { method: "POST" },
  ).then((response) => response.data);
}
