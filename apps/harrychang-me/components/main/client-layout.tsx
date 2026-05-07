"use client";

import type React from "react";
import { Suspense } from "react";
import Header from "@/components/header";
import ClickSpark from "@portfolio/ui/ui/click-spark";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { LanguageProvider } from "@portfolio/lib/contexts/language-context";

import { ThemeProvider } from "@portfolio/lib/contexts/theme-context";
import VideoInitializer from "@portfolio/ui/video-initializer";
import NotificationProvider from "@portfolio/ui/notification-provider";
import { useStableAnchor } from "@portfolio/lib/hooks/use-stable-anchor";
import PostHogSuperProperties from "@/components/posthog-super-properties";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = useIsMobile();

  useStableAnchor(["projects", "gallery"], "header");

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PostHogSuperProperties />
        <Header />
        {isMobile ? (
          children
        ) : (
          <ClickSpark
            sparkColor="hsl(var(--primary))"
            sparkSize={8}
            sparkRadius={15}
            sparkCount={4}
            duration={500}
            extraScale={1}
          >
            {children}
          </ClickSpark>
        )}
        <VideoInitializer />
        <Suspense fallback={null}>
          <NotificationProvider />
        </Suspense>
      </LanguageProvider>
    </ThemeProvider>
  );
}
