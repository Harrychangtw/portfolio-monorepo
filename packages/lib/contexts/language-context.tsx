"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  Suspense,
} from "react";
import { getCookie, setCookie } from "@portfolio/lib/lib/cookies";

export type Language = "en" | "zh-TW";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, namespace?: string) => string;
  tHtml: (key: string, namespace?: string) => React.ReactNode;
  getTranslationData: (key: string, namespace?: string) => any;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export interface Translations {
  [namespace: string]: {
    [key: string]: any;
  };
}

/**
 * Translation data compiled into the JS bundle rather than fetched at runtime.
 *
 * When supplied, the provider has the strings on its very first render, so
 * pages server-render real text instead of a placeholder and no locale JSON is
 * requested on load. Omit it and the provider falls back to the original
 * fetch-then-reveal behaviour.
 */
export type BundledTranslations = Partial<Record<Language, Translations>>;

// Helper function to parse HTML strings and convert to React elements
const parseHtmlToReact = (
  htmlString: string,
  InternalLink?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>,
): React.ReactNode => {
  const tagRegex =
    /<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>|<strong>([^<]*)<\/strong>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = tagRegex.exec(htmlString)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = htmlString.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(<span key={`text-${key++}`}>{textBefore}</span>);
      }
    }

    if (match[3] !== undefined) {
      parts.push(
        <strong key={`strong-${key++}`} className="font-medium">
          {match[3]}
        </strong>,
      );
    } else {
      const href = match[1];
      const linkText = match[2];
      const isExternal = /^https?:\/\//.test(href);
      // mailto:/tel:/sms: are absolute URIs, not site paths. They used to fall
      // through to InternalLink, which prefixed a slash (→ /mailto:someone@…)
      // and fired the route-loading transition on a link that never navigates.
      const isNonHttpScheme = !isExternal && /^[a-z][a-z0-9+.-]*:/i.test(href);
      const isHash = href.startsWith("#");

      if (isExternal || isNonHttpScheme || isHash) {
        parts.push(
          <a
            key={`link-${key++}`}
            href={href}
            {...(isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="link-external"
          >
            {linkText}
          </a>,
        );
      } else if (InternalLink) {
        const resolvedHref = href.startsWith("/") ? href : `/${href}`;
        parts.push(
          <InternalLink
            key={`link-${key++}`}
            href={resolvedHref}
            className="link-external"
          >
            {linkText}
          </InternalLink>,
        );
      } else {
        parts.push(
          <a key={`link-${key++}`} href={href} className="link-external">
            {linkText}
          </a>,
        );
      }
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < htmlString.length) {
    const remainingText = htmlString.substring(lastIndex);
    if (remainingText) {
      parts.push(<span key={`text-${key++}`}>{remainingText}</span>);
    }
  }

  return parts.length > 0 ? <>{parts}</> : htmlString;
};

const DEFAULT_NAMESPACES = ["common", "about", "updates", "uses", "cv"];

/**
 * The server has no cookies or `navigator` to read, so it always renders
 * English. The client's first render must produce identical markup or
 * hydration fails, so it starts here too and adopts the visitor's real
 * language in a layout effect — which React flushes before the browser
 * paints, so a zh-TW reader never sees the English frame.
 */
const SSR_LANGUAGE: Language = "en";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

function detectLanguage(englishOnly: boolean): Language {
  if (typeof window === "undefined" || englishOnly) {
    return "en";
  }
  // Priority 1: URL query param (?lang=zh-tw)
  const params = new URLSearchParams(window.location.search);
  if (params.get("lang")?.toLowerCase() === "zh-tw") {
    return "zh-TW";
  }

  // Priority 2: URL path suffix ([slug]_zh-tw)
  if (window.location.pathname.replace(/\/$/, "").endsWith("_zh-tw")) {
    return "zh-TW";
  }

  const saved = getCookie("language") as Language | null;
  if (saved === "en" || saved === "zh-TW") {
    return saved;
  }

  // Fallback to browser language detection
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh-TW" : "en";
}

export function LanguageProvider({
  children,
  englishOnly = false,
  namespaces = DEFAULT_NAMESPACES,
  internalLinkComponent,
  bundledTranslations,
}: {
  children: React.ReactNode;
  englishOnly?: boolean;
  namespaces?: string[];
  internalLinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  bundledTranslations?: BundledTranslations;
}) {
  const hasBundled = Boolean(bundledTranslations?.[SSR_LANGUAGE]);

  const [language, setLanguageState] = useState<Language>(() =>
    hasBundled ? SSR_LANGUAGE : detectLanguage(englishOnly),
  );

  const [translations, setTranslations] = useState<Translations>(
    () => bundledTranslations?.[SSR_LANGUAGE] ?? {},
  );
  const [isLoading, setIsLoading] = useState(!hasBundled);
  // Track if we've completed the first load
  const [hasLoadedOnce, setHasLoadedOnce] = useState(hasBundled);

  // Adopt the visitor's real language once mounted. Bundled data means this is
  // a synchronous state change with no network in between.
  useIsomorphicLayoutEffect(() => {
    if (!hasBundled) return;
    const detected = detectLanguage(englishOnly);
    if (detected !== SSR_LANGUAGE) {
      setLanguageState(detected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load translations for a specific language
  const loadTranslations = async (lang: Language) => {
    // Already compiled in — no request, no loading state, no gate. Passing the
    // same object reference back lets React bail out of the re-render.
    const preloaded = bundledTranslations?.[lang];
    if (preloaded) {
      setTranslations(preloaded);
      setHasLoadedOnce(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const translationPromises = namespaces.map(async (namespace) => {
        // In dev: Add timestamp to URL to force fresh fetch
        // In prod: Clean URL allows standard caching
        const url = `/locales/${lang}/${namespace}.json${process.env.NODE_ENV === "development" ? `?t=${Date.now()}` : ""}`;

        const response = await fetch(url, {
          // In dev: 'no-store' prevents caching entirely
          // In prod: 'no-cache' allows caching but forces validation (ETag check) with server before using it
          cache:
            process.env.NODE_ENV === "development" ? "no-store" : "no-cache",
        });
        if (response.ok) {
          const data = await response.json();
          return { namespace, data };
        }
        return { namespace, data: {} };
      });

      const results = await Promise.all(translationPromises);
      const newTranslations: Translations = {};

      results.forEach(({ namespace, data }) => {
        newTranslations[namespace] = data;
      });

      setTranslations(newTranslations);
      setHasLoadedOnce(true); // First load finished
    } catch (error) {
      console.error("Failed to load translations:", error);
      // Even on error, mark as loaded to prevent infinite hidden state
      setHasLoadedOnce(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load once on mount and whenever language changes
  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  // Translation function for plain text
  const t = (key: string, namespace: string = "common"): string => {
    // Never show raw keys before first load completes
    if (!hasLoadedOnce) return "";

    const keys = key.split(".");
    let value: any = translations[namespace];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        // Return empty string instead of key to avoid flashing keys
        return "";
      }
    }

    return typeof value === "string" ? value : "";
  };

  // Translation function that returns React nodes for HTML content
  const tHtml = (
    key: string,
    namespace: string = "common",
  ): React.ReactNode => {
    const translatedText = t(key, namespace);
    return parseHtmlToReact(translatedText, internalLinkComponent);
  };

  // Function to get translation data (including arrays and objects)
  const getTranslationData = (
    key: string,
    namespace: string = "common",
  ): any => {
    if (!hasLoadedOnce) return null;

    let value: any = translations[namespace];

    // If key is empty, return the entire namespace
    if (!key || key === "") {
      return value;
    }

    const keys = key.split(".");
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return null; // Return null if translation not found
      }
    }

    return value;
  };

  // Set language and update localStorage; fetch happens via useEffect
  const setLanguage = (lang: Language) => {
    if (englishOnly) {
      // In English-only mode, prevent language changes
      return;
    }
    setLanguageState(lang);
    setCookie("language", lang);
  };

  // Gate visibility until first load completes (prevents FOUC without layout shift)
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tHtml,
        getTranslationData,
        isLoading,
      }}
    >
      {!hasLoadedOnce ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "hsl(var(--background))",
            zIndex: 9999,
          }}
        />
      ) : (
        <Suspense fallback={null}>{children}</Suspense>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
