import { NextResponse } from "next/server";
import { getMarketplaceGatewayUrl } from "../../../../../../lib/server/marketplaceGateway";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { productId } = await params;
  const productUrl = getMarketplaceGatewayUrl(
    `/api/v1/marketplace/materials/${encodeURIComponent(productId)}`,
  );

  if (!productUrl) {
    return NextResponse.json(
      { message: "The marketplace API is not configured." },
      { status: 503 },
    );
  }

  try {
    const productResponse = await fetch(productUrl, { cache: "no-store" });
    if (!productResponse.ok)
      return NextResponse.json({ message: "Marketplace product not found." }, { status: 404 });

    const productPayload = await productResponse.json();
    const thumbnailMaterialId = productPayload?.data?.thumbnailMaterialId;
    if (!thumbnailMaterialId) {
      return NextResponse.json({ message: "This product has no thumbnail." }, { status: 404 });
    }

    const thumbnailUrl = getMarketplaceGatewayUrl(
      `/api/v1/materials/${encodeURIComponent(thumbnailMaterialId)}/public-thumbnail`,
    );
    const thumbnailResponse = await fetch(thumbnailUrl, {
      redirect: "manual",
      cache: "no-store",
    });
    const location = thumbnailResponse.headers.get("location");
    if (!location) {
      return NextResponse.json({ message: "Thumbnail is unavailable." }, { status: 404 });
    }

    return NextResponse.redirect(location, 302);
  } catch {
    return NextResponse.json(
      { message: "Thumbnail service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
