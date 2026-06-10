import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin file-tracing root to the monorepo so Next bundles content/** into
  // the serverless function regardless of workspace auto-detection.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/api/**/*": ["./content/**/*"],
  },
  // Keep public/images/** out of serverless function bundles. The CDN serves
  // these as static assets; the responsive variants emitted by
  // scripts/optimize-images.js would otherwise push the function size past
  // Vercel's 300MB limit.
  outputFileTracingExcludes: {
    "*": ["public/images/**"],
  },

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

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value:
              "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
      {
        // Ensure robots.txt and sitemap.xml are properly served
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        // Pre-built optimized images at fixed paths. URL must change if
        // contents change (e.g. rename the file or add a version suffix)
        // since `immutable` tells browsers never to revalidate.
        source: "/images/optimized/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Favicon/icon assets: stable filenames, rarely change. Bump filenames
      // to bust if ever swapped.
      ...["/favicon.png", "/apple-icon.png", "/safari-pinned-tab.svg"].map(
        (source) => ({
          source,
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        }),
      ),
    ];
  },

  // Webpack configuration for 3D models
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
