import { forwardMarketplaceRequest } from "../../../../../lib/server/marketplaceGateway";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { productId } = await params;

  return forwardMarketplaceRequest(
    `/api/v1/marketplace/materials/${encodeURIComponent(productId)}`,
  );
}
