import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: process.env.NEXT_PUBLIC_APP_BASE_PATH || "",
  async rewrites() {
    return [{ source: "/:path*", destination: "/" }];
  },
  experimental: { externalDir: true },
  turbopack: { root: path.resolve(projectDirectory, "..") },
};

export default nextConfig;
