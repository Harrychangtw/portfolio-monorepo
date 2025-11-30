"use client"

import type React from "react"
import { Suspense } from "react"
import Header from "@/components/header"
import { Analytics } from "@vercel/analytics/react"
import ClickSpark from "@portfolio/ui/ui/click-spark"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
import { LanguageProvider } from "@portfolio/lib/contexts/LanguageContext"
import { NavigationProvider } from "@portfolio/lib/contexts/NavigationContext"
import VideoInitializer from "@portfolio/ui/video-initializer"
import NotificationProvider from "@portfolio/ui/notification-provider"
import { useStableAnchor } from "@portfolio/lib/hooks/use-stable-anchor"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsMobile()

  useStableAnchor(["projects", "gallery"], "header")

  return (
    <NavigationProvider>
      <LanguageProvider>
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
            extraScale={1.2}
          >
            {children}
          </ClickSpark>
        )}
        <VideoInitializer />
        <Suspense fallback={null}>
          <NotificationProvider />
        </Suspense>
        <Analytics />
      </LanguageProvider>
    </NavigationProvider>
  )
}

