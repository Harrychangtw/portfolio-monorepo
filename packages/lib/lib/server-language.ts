/**
 * Server-side resolution of the visitor's language.
 *
 * The provider used to hardcode English for the server render and adopt the
 * real language in a layout effect. That effect only runs once React has
 * hydrated, which is well after the browser has painted the server's HTML —
 * so every zh-TW visitor watched the page load in English and then swap.
 *
 * Resolving it by reading cookies() in the layouts fixed that, but made every
 * page dynamic: each view became a serverless render instead of a CDN hit,
 * which tanked TTFB/LCP. So the decision now happens in the middleware, which
 * rewrites `/blog` to `/<lang>/blog` internally. Every page lives under the
 * `app/[lang]` segment and is prerendered once per language; the public URL
 * never shows the prefix.
 *
 * This module must stay free of `next/headers` and Node APIs — the middleware
 * runs on the edge runtime and imports it.
 */
import type { Language } from "@portfolio/lib/contexts/language-context";

export const LANGUAGES: readonly Language[] = ["en", "zh-TW"];

export const LANGUAGE_COOKIE = "language";

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "zh-TW";
}

/** `generateStaticParams` for the `[lang]` segment. */
export function languageParams(): { lang: Language }[] {
  return LANGUAGES.map((lang) => ({ lang }));
}

/**
 * The `[lang]` route param as a Language. The root layout sets
 * `dynamicParams = false`, so anything else has already 404'd; the fallback
 * only satisfies the type.
 */
export async function languageFromParams(
  params: Promise<{ lang: string }>,
): Promise<Language> {
  const { lang } = await params;
  return isLanguage(lang) ? lang : "en";
}

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

/**
 * Checks the same four signals, in the same order, as the client's
 * detectLanguage(): the `?lang=` query param, a `_zh-tw` path suffix, the
 * saved cookie, then the browser's preferred language. Parity matters — any
 * signal missed here becomes a visible post-hydration swap.
 */
export function resolveLanguage({
  search,
  pathname,
  cookie,
  acceptLanguage,
}: {
  search: URLSearchParams;
  pathname: string;
  cookie: string | undefined;
  acceptLanguage: string | null;
}): Language {
  // Priority 1: URL query param (?lang=zh-tw)
  if (search.get("lang")?.toLowerCase() === "zh-tw") {
    return "zh-TW";
  }

  // Priority 2: URL path suffix ([slug]_zh-tw)
  if (pathname.replace(/\/$/, "").endsWith("_zh-tw")) {
    return "zh-TW";
  }

  // Priority 3: the visitor's saved choice.
  if (isLanguage(cookie)) {
    return cookie;
  }

  // Priority 4: browser preference, for a first visit with no cookie yet.
  return prefersChinese(acceptLanguage) ? "zh-TW" : "en";
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

/**
 * Static params for a `[slug]` route under `[lang]`.
 *
 * The middleware resolves any `_zh-tw` URL to zh-TW, so English only ever
 * renders base slugs; Chinese can arrive on either form (a base-slug URL with
 * a zh-TW cookie). Anything not listed still renders on demand and is cached.
 */
export function slugParamsFor(
  lang: string,
  slugs: string[],
): { slug: string }[] {
  const reachable =
    lang === "en" ? slugs.filter((slug) => !/_zh-tw$/i.test(slug)) : slugs;
  return reachable.map((slug) => ({ slug }));
}
