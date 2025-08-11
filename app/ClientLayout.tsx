"use client"

import type React from "react"
import Header from "@/components/header"
import { Analytics } from "@vercel/analytics/react"
import ClickSpark from "@/components/ui/click-spark"
import { useIsMobile } from "@/hooks/use-mobile"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { SectionLoadingProvider } from "@/components/lazy-section-loader"
import VideoInitializer from "@/components/video-initializer"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsMobile()
  
  return (
    <LanguageProvider>
      <SectionLoadingProvider>
        <Header />
        {isMobile ? (
          children
        ) : (
          <ClickSpark
            sparkColor="#ffffff"
            sparkSize={8}
            sparkRadius={15}
            sparkCount={4}
            duration={500}
            extraScale={1.2}
          >
            {children}
          </ClickSpark>
        )}
        <VideoInitializer />
        <Analytics />
      </SectionLoadingProvider>
    </LanguageProvider>
  )
}

