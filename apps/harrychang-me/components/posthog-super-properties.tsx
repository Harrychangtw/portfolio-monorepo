"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { useTheme } from "@portfolio/lib/contexts/theme-context";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

/**
 * Re-registers PostHog super-properties whenever the Theme/Language contexts
 * change. Mounted inside each route group's client-layout so it sits beneath
 * the ThemeProvider and LanguageProvider.
 */
export default function PostHogSuperProperties() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!posthog.__loaded) return;
    posthog.register({ theme, locale: language.toLowerCase() });
  }, [theme, language]);

  return null;
}
