import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // ✅ REQUIRED for out/
  trailingSlash: true, // ✅ folder-based routing
  images: {
    unoptimized: true, //  server side pe comment karna haio
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
