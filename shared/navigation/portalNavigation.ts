const portalBasePath = () => process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

export function getPortalPath(route: string, routeSlugs: Record<string, string> = {}) {
  const basePath = portalBasePath();
  const slug = routeSlugs[route] ?? route;
  return slug === "dashboard" ? basePath || "/" : `${basePath}/${slug}`;
}

export function getRouteFromPortalPath(pathname: string, validRoutes: Set<string>) {
  const basePath = portalBasePath();
  const normalizedPath = basePath
    ? pathname === basePath
      ? ""
      : pathname.startsWith(`${basePath}/`)
        ? pathname.slice(basePath.length)
        : pathname
    : pathname;
  const slug = normalizedPath.split("/").filter(Boolean)[0];
  return slug && validRoutes.has(slug) ? slug : null;
}

export function getPortalPathSegments(pathname: string) {
  const basePath = portalBasePath();
  const normalizedPath = basePath
    ? pathname === basePath
      ? ""
      : pathname.startsWith(`${basePath}/`)
        ? pathname.slice(basePath.length)
        : pathname
    : pathname;

  return normalizedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}
