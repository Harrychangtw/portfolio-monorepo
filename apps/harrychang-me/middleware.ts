import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  LANGUAGE_COOKIE,
  resolveLanguage,
} from "@portfolio/lib/lib/server-language";

// Note: outbound social/profile redirects (/github, /linkedin, /instagram,
// /spotify, /discord, /letterboxd, /medium, /telegram, /cal, /email, /readme)
// are handled by next.config.mjs `redirects()` so they're served at the CDN
// edge as 308s without invoking the middleware function.

/**
 * Paths that are not App Router pages and so must not get a language prefix:
 * API routes, Next internals, the Marp decks next.config rewrites into
 * public/slides, and anything with a file extension (public/ assets, feeds,
 * robots.txt, sitemap.xml).
 */
function isPagePath(pathname: string): boolean {
  if (/^\/(api|_next|slides|ingest|locales|images|fonts)(\/|$)/.test(pathname))
    return false;
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return !lastSegment.includes(".");
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Check if this is a Vercel preview deployment. Previews allow direct access
  // to /lab routes, e.g. https://your-project-git-branch-username.vercel.app/lab
  const isVercelPreview = hostname.includes(".vercel.app");

  // Handle non-www to www redirect for main domain
  // This ensures search engines see consistent metadata and canonical URLs
  // Using 308 (Permanent Redirect) instead of 301 to preserve request method
  if (!isVercelPreview && hostname === "harrychang.me") {
    const newUrl = new URL(request.url);
    newUrl.host = "www.harrychang.me";
    return NextResponse.redirect(newUrl, 308);
  }

  // Older links used an uppercase `_zh-TW` suffix. Pages are prerendered per
  // slug, so fold those onto the canonical lowercase URL instead of 404ing.
  if (/_zh-tw$/i.test(url.pathname) && !url.pathname.endsWith("_zh-tw")) {
    const newUrl = url.clone();
    newUrl.pathname = url.pathname.replace(/_zh-tw$/i, "_zh-tw");
    return NextResponse.redirect(newUrl, 308);
  }

  const isPage = isPagePath(url.pathname);
  let pathname = url.pathname;

  if (!isVercelPreview) {
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
      // For localhost, serve /graph routes without redirect
      if (isPage && !pathname.startsWith("/graph")) {
        pathname = `/graph${pathname === "/" ? "" : pathname}`;
      }
    }

    if (isLab && isPage && !pathname.startsWith("/lab")) {
      // Serve lab routes (only for page routes; shared resources pass through)
      pathname = `/lab${pathname === "/" ? "" : pathname}`;
    }

    // Prevent accessing lab routes from main domain in production
    if (!isLab && url.pathname.startsWith("/lab")) {
      const newUrl = url.clone();
      newUrl.pathname = "/";
      return NextResponse.redirect(newUrl);
    }
  }

  if (!isPage) {
    return NextResponse.next();
  }

  // Pages live under app/[lang] and are prerendered once per language, so
  // picking the visitor's language is just choosing which static copy to
  // serve. The prefix is internal: the browser URL never changes, and a
  // direct request for /en/... gets prefixed again and 404s.
  const language = resolveLanguage({
    search: url.searchParams,
    pathname: url.pathname,
    cookie: request.cookies.get(LANGUAGE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const rewritten = url.clone();
  rewritten.pathname = `/${language}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(rewritten);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|locales|fonts|ingest).*)",
  ],
};
