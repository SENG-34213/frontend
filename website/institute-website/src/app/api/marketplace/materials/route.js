import { forwardMarketplaceRequest } from "../../../../lib/server/marketplaceGateway";

const PAGE_SIZE = 100;

export const dynamic = "force-dynamic";

export async function GET(request) {
  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams({
    page: String(Math.max(0, Number(incoming.get("page") || 1) - 1)),
    size: String(Math.min(100, Math.max(1, Number(incoming.get("limit") || PAGE_SIZE)))),
    sort: incoming.get("sort") || "publishedAt,desc",
  });

  ["search", "subject", "gradeId", "category", "isFree"].forEach((key) => {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  });

  return forwardMarketplaceRequest("/api/v1/marketplace/materials", query);
}
