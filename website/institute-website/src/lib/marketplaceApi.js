async function request(path, signal) {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const error = new Error("The resource catalogue could not be loaded.");
    error.status = response.status;
    throw error;
  }

  return payload.data;
}

export async function listPublicMarketplaceProducts(signal) {
  const page = await request("/api/marketplace/materials?page=0", signal);

  if (!page || !Array.isArray(page.content)) {
    throw new Error("The resource catalogue returned an invalid response.");
  }

  return page.content;
}

export function getPublicMarketplaceProduct(productId, signal) {
  return request(`/api/marketplace/materials/${encodeURIComponent(productId)}`, signal);
}

export function formatMarketplaceCategory(category) {
  return String(category || "OTHER")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatMarketplacePrice(product) {
  if (product.free) return null;

  const amount = Number(product.finalPrice ?? product.price);
  if (!Number.isFinite(amount)) return null;

  return `${product.currency || "LKR"} ${amount.toFixed(2)}`;
}
