import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    unoptimized: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // Webpack configuration for 3D models
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });
    return config;
  },

  // Keep public/images/** out of serverless function bundles. The CDN serves
  // these as static assets; the responsive variants emitted by
  // scripts/optimize-images.js would otherwise push the function size past
  // Vercel's 300MB limit.
  outputFileTracingExcludes: {
    "*": ["public/images/**"],
  },
};

export default nextConfig;
