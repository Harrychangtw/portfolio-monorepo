"use client";

import type React from "react";
import { LanguageProvider } from "@portfolio/lib/contexts/language-context";
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
      <LanguageProvider>
        <PostHogSuperProperties />
        <Header />
        <main className="flex-1 pt-16">{children}</main>
      </LanguageProvider>
    </ThemeProvider>
  );
}
