import { NextResponse } from "next/server";

export function getMarketplaceGatewayUrl(path, searchParams) {
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
  const url = getMarketplaceGatewayUrl(path, searchParams);

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

export async function forwardMarketplaceMutation(path, request) {
  const url = getMarketplaceGatewayUrl(path);

  if (!url) {
    return NextResponse.json(
      { message: "The payment service is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const body = await request.text();
    const headers = {
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") || "application/json",
    };
    const authorization = request.headers.get("authorization");
    if (authorization) headers.Authorization = authorization;

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
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
      { message: "The payment service is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
