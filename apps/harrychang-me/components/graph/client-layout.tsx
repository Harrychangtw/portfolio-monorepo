"use client";

import type React from "react";
import { LanguageProvider } from "@portfolio/lib/contexts/language-context";
import NavigationLink from "@portfolio/ui/navigation-link";
import { ThemeProvider } from "@portfolio/lib/contexts/theme-context";
import Header from "@/components/header";
import PostHogSuperProperties from "@/components/posthog-super-properties";

export default function GraphClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <LanguageProvider internalLinkComponent={NavigationLink}>
        <PostHogSuperProperties />
        <Header />
        <main className="flex-1 pt-16">{children}</main>
      </LanguageProvider>
    </ThemeProvider>
  );
}
