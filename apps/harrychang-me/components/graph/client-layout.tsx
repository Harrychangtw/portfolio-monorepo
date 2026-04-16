"use client";

import type React from "react";
import { LanguageProvider } from "@portfolio/lib/contexts/language-context";
import { NavigationProvider } from "@portfolio/lib/contexts/navigation-context";
import { ThemeProvider } from "@portfolio/lib/contexts/theme-context";
import Header from "@/components/header";
import PageTransition from "@/components/main/page-transition";

export default function GraphClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <LanguageProvider>
          <PageTransition>
            <Header />
            <main className="flex-1 pt-16">{children}</main>
          </PageTransition>
        </LanguageProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}
