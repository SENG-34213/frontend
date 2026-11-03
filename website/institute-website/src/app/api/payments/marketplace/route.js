import { forwardMarketplaceMutation } from "../../../../lib/server/marketplaceGateway";

export const dynamic = "force-dynamic";

export async function POST(request) {
  return forwardMarketplaceMutation("/api/v1/payments/marketplace", request);
}
