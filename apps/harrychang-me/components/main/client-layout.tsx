"use client";

import type React from "react";
import { Suspense } from "react";
import Header from "@/components/header";
import { Analytics } from "@vercel/analytics/react";
import ClickSpark from "@portfolio/ui/ui/click-spark";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import {
  LanguageProvider,
  type Language,
} from "@portfolio/lib/contexts/language-context";
import { bundledTranslations } from "@/lib/bundled-translations";
import NavigationLink from "@portfolio/ui/navigation-link";
import { ThemeProvider } from "@portfolio/lib/contexts/theme-context";
import VideoInitializer from "@portfolio/ui/video-initializer";
import NotificationProvider from "@portfolio/ui/notification-provider";
import { useStableAnchor } from "@portfolio/lib/hooks/use-stable-anchor";
import PostHogSuperProperties from "@/components/posthog-super-properties";

export default function ClientLayout({
  children,
  initialLanguage,
}: Readonly<{
  children: React.ReactNode;
  initialLanguage: Language;
}>) {
  const isMobile = useIsMobile();

  useStableAnchor(["projects", "gallery"], "header");

  return (
    <ThemeProvider>
      <LanguageProvider
        internalLinkComponent={NavigationLink}
        bundledTranslations={bundledTranslations}
        initialLanguage={initialLanguage}
      >
        <PostHogSuperProperties />
        <Header />
        {/*
          Always rendered, disabled rather than unmounted on mobile.
          useIsMobile() is false during SSR and flips true after mount, so a
          ternary here swapped the element tree underneath {children} and
          remounted the entire page on every mobile load.
        */}
        <ClickSpark
          enabled={!isMobile}
          sparkColor="hsl(var(--primary))"
          sparkSize={8}
          sparkRadius={15}
          sparkCount={4}
          duration={500}
          extraScale={1}
        >
          {children}
        </ClickSpark>
        <VideoInitializer />
        <Suspense fallback={null}>
          <NotificationProvider />
        </Suspense>
        <Analytics />
      </LanguageProvider>
    </ThemeProvider>
  );
}
