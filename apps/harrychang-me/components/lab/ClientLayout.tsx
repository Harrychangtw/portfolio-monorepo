"use client"

import type React from "react"
import { LanguageProvider } from "@portfolio/lib/contexts/LanguageContext"
import Header from "@portfolio/ui/header"
import Footer from "@portfolio/ui/footer"

/**
 * Client layout wrapper for the Lab subdomain.
 * Includes header and footer from main site.
 */
export default function LabClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}
