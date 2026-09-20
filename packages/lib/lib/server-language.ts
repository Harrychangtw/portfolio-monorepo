/**
 * Server-side resolution of the visitor's language.
 *
 * The provider used to hardcode English for the server render and adopt the
 * real language in a layout effect. That effect only runs once React has
 * hydrated, which is well after the browser has painted the server's HTML —
 * so every zh-TW visitor watched the page load in English and then swap.
 *
 * This checks the same four signals, in the same order, as the client's
 * detectLanguage(): the `?lang=` query param, a `_zh-tw` path suffix, the
 * saved cookie, then the browser's preferred language. The first two come
 * from headers the middleware forwards, since a Server Component cannot
 * otherwise see the URL. Parity matters — any signal the server misses
 * becomes a visible post-hydration swap.
 *
 * Cost: calling this opts the route subtree out of static rendering.
 */
import { cookies, headers } from "next/headers";

import type { Language } from "@portfolio/lib/contexts/language-context";
import {
  PATHNAME_HEADER,
  SEARCH_HEADER,
} from "@portfolio/lib/lib/request-headers";

export const LANGUAGE_COOKIE = "language";

/**
 * Mirrors the client's `navigator.language?.toLowerCase().startsWith("zh")`.
 * Only the first entry is read, because that is the single value
 * `navigator.language` exposes — weighing the whole q-list here would make
 * the server disagree with the client for some visitors.
 */
function prefersChinese(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false;
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  return Boolean(first?.startsWith("zh"));
}

export async function getServerLanguage(): Promise<Language> {
  // `cookies()` and `headers()` are request-scoped and memoised by Next, so
  // calling this from several layouts and pages in one render costs one read.
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  // Priority 1: URL query param (?lang=zh-tw)
  const search = headerStore.get(SEARCH_HEADER);
  if (search) {
    const params = new URLSearchParams(search);
    if (params.get("lang")?.toLowerCase() === "zh-tw") {
      return "zh-TW";
    }
  }

  // Priority 2: URL path suffix ([slug]_zh-tw)
  const pathname = headerStore.get(PATHNAME_HEADER);
  if (pathname && pathname.replace(/\/$/, "").endsWith("_zh-tw")) {
    return "zh-TW";
  }

  // Priority 3: the visitor's saved choice.
  const saved = cookieStore.get(LANGUAGE_COOKIE)?.value;
  if (saved === "zh-TW" || saved === "en") {
    return saved;
  }

  // Priority 4: browser preference, for a first visit with no cookie yet.
  return prefersChinese(headerStore.get("accept-language")) ? "zh-TW" : "en";
}

/** BCP 47 tag for the `<html lang>` attribute. */
export function htmlLang(language: Language): string {
  return language === "zh-TW" ? "zh-Hant-TW" : "en";
}

/**
 * The slug of `slug`'s counterpart in `language`.
 *
 * Detail-page URLs carry one language's slug (`foo` / `foo_zh-tw`). A visitor
 * reading the other language should get their version in the server HTML
 * rather than watching the page refetch it after hydration, so the page looks
 * this up first and falls back to the requested slug when no translation
 * exists. Locale suffixes are lowercase by convention, but older links used
 * `_zh-TW`, so the match is case-insensitive.
 */
export function localizedSlug(slug: string, language: Language): string {
  const baseSlug = slug.replace(/_zh-tw$/i, "");
  return language === "zh-TW" ? `${baseSlug}_zh-tw` : baseSlug;
}
