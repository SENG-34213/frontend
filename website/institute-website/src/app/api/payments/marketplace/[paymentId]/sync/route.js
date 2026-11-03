import { forwardMarketplaceMutation } from "../../../../../../lib/server/marketplaceGateway";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const { paymentId } = await params;
  return forwardMarketplaceMutation(`/api/v1/payments/marketplace/${paymentId}/sync`, request);
}
