import { forwardMarketplaceRequest } from "../../../../lib/server/marketplaceGateway";

const PAGE_SIZE = 100;

export const dynamic = "force-dynamic";

export async function GET() {
  const query = new URLSearchParams({
    page: "0",
    size: String(PAGE_SIZE),
    sort: "publishedAt,desc",
  });

  return forwardMarketplaceRequest("/api/v1/marketplace/materials", query);
}
