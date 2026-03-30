"use client";

import type React from "react";
import { LanguageProvider } from "@portfolio/lib/contexts/language-context";
import { NavigationProvider } from "@portfolio/lib/contexts/navigation-context";
import { ThemeProvider } from "@portfolio/lib/contexts/theme-context";
import Header from "@/components/header";
import Footer from "@/components/footer";

/**
 * Client layout wrapper for the Lab subdomain.
 * Includes header and footer from main site.
 */
export default function LabClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}
