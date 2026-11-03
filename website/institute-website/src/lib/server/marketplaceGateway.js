import { NextResponse } from "next/server";

function getGatewayUrl(path, searchParams) {
  const configuredUrl =
    process.env.API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configuredUrl) return null;

  const baseUrl = configuredUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = baseUrl.endsWith("/api")
    ? normalizedPath.replace(/^\/api(?=\/|$)/, "")
    : normalizedPath;
  const query = searchParams?.toString();

  return `${baseUrl}${apiPath}${query ? `?${query}` : ""}`;
}

export async function forwardMarketplaceRequest(path, searchParams) {
  const url = getGatewayUrl(path, searchParams);

  if (!url) {
    return NextResponse.json(
      { message: "The marketplace API is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "The marketplace service is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
