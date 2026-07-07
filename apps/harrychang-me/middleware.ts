import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Note: outbound social/profile redirects (/github, /linkedin, /instagram,
// /spotify, /discord, /letterboxd, /medium, /telegram, /cal, /email, /readme)
// are handled by next.config.mjs `redirects()` so they're served at the CDN
// edge as 308s without invoking the middleware function.

// camp.harrychang.me — a short, phone-typeable front door for the SITCON Camp
// 2026 ML Course 2 live stations. Every path is forwarded verbatim to the
// GPU box's Tailscale Funnel, so students type `camp.harrychang.me/tokenizer`
// instead of the unmemorable `.ts.net` hostname off a slide.
//
// SINGLE SOURCE OF TRUTH: if the Funnel address changes (it is not stable
// across `tailscale funnel` restarts), update ONLY this constant, then
// redeploy. No per-path edits. No trailing slash.
const CAMP_STATION_BASE_URL =
  "https://sitconcamp-gpu-v100x4.boreray-hippocampus.ts.net";

// Where the camp root (`camp.harrychang.me/`) sends people who don't type a
// station path — the hosted Course 2 deck on the main site.
const CAMP_ROOT_DESTINATION =
  "https://www.harrychang.me/slides/sitcon-camp-26-ml-course2";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Check if this is a Vercel preview deployment
  const isVercelPreview = hostname.includes(".vercel.app");

  // For Vercel preview deployments, allow direct access to /lab routes
  // This enables testing lab functionality on preview URLs like:
  // https://your-project-git-branch-username.vercel.app/lab
  if (isVercelPreview) {
    return NextResponse.next();
  }

  // Handle camp subdomain — forward every path to the live station Funnel.
  // Uses 307 (Temporary) on purpose: the Funnel target is not permanent, so
  // browsers/caches must not pin these redirects the way a 308 would.
  const isCamp =
    hostname.includes("camp.harrychang.me") ||
    hostname.includes("camp.localhost");

  if (isCamp) {
    // Bare host → the hosted deck rather than a naked directory listing.
    if (url.pathname === "/") {
      return NextResponse.redirect(CAMP_ROOT_DESTINATION, 307);
    }
    // Any station path (and its query string) → the tunnel, unchanged.
    const target = new URL(CAMP_STATION_BASE_URL);
    target.pathname = url.pathname;
    target.search = url.search;
    return NextResponse.redirect(target, 307);
  }

  // Handle non-www to www redirect for main domain
  // This ensures search engines see consistent metadata and canonical URLs
  // Using 308 (Permanent Redirect) instead of 301 to preserve request method
  if (hostname === "harrychang.me") {
    const newUrl = new URL(request.url);
    newUrl.host = "www.harrychang.me";
    return NextResponse.redirect(newUrl, 308);
  }

  // Handle lab subdomain (only for production/localhost)
  const isLab =
    hostname.includes("lab.harrychang.me") ||
    hostname.includes("lab.localhost");

  // Handle graph subdomain — redirect to main domain /graph
  const isGraph =
    hostname.includes("graph.harrychang.me") ||
    hostname.includes("graph.localhost");

  if (isGraph) {
    // In production, redirect to main domain /graph
    if (hostname.includes("graph.harrychang.me")) {
      const newUrl = new URL(request.url);
      newUrl.host = "www.harrychang.me";
      newUrl.pathname = `/graph${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.redirect(newUrl, 308);
    }
    // For localhost, rewrite to /graph routes without redirect
    if (!url.pathname.startsWith("/graph")) {
      url.pathname = `/graph${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Paths that should NOT be rewritten (shared resources)
  const sharedPaths = [
    "/api/", // API routes are shared
    "/locales/", // Translation files are shared
    "/images/", // Images are shared
    "/_next/", // Next.js internals
    "/favicon.ico",
    "/robots.txt", // Allow dynamic robots.txt
    "/sitemap.xml", // Allow dynamic sitemap
    "/googleb0d95f7ad2ffc31f.html",
    "/language.svg",
    "/theme_moon.svg",
    "/theme_sun.svg",
    "/chinese_name_icon.png",
    "/placeholder-logo.png",
    "/images/og-image.webp",
    "/images/og-image-lab.webp",
    "/images/og-image-blogs.webp",
    "/images/og-image-projects.webp",
    "/images/og-image-gallery.webp",
    "/images/og-image-graph.webp",
    "/apple-icon.png",
    "/safari-pinned-tab.svg",
    "/favicon-lab.ico",
    "/apple-icon-lab.png",
    "/safari-pinned-tab-lab.svg",
    "/graph-data.json",
  ];

  const isSharedPath = sharedPaths.some((path) =>
    url.pathname.startsWith(path),
  );

  if (isLab && !url.pathname.startsWith("/lab") && !isSharedPath) {
    // Rewrite to lab routes (only for page routes)
    url.pathname = `/lab${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Prevent accessing lab routes from main domain in production
  if (!isLab && url.pathname.startsWith("/lab")) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|locales|fonts|ingest).*)",
  ],
};
