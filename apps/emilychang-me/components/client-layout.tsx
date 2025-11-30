"use client"

import type React from "react"
import { Suspense } from "react"
import EmilyHeader from './emily-header'
import { Analytics } from "@vercel/analytics/react"
import ClickSpark from "@portfolio/ui/ui/click-spark"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
import { LanguageProvider } from '@portfolio/lib/contexts/language-context'
import VideoInitializer from "@portfolio/ui/video-initializer"
import NotificationProvider from "@portfolio/ui/notification-provider"
import { useStableAnchor } from "@portfolio/lib/hooks/use-stable-anchor"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsMobile()

  useStableAnchor(["design", "creation", "art", "sketches"], "header")

  return (
    <LanguageProvider englishOnly>
      <EmilyHeader />
      {isMobile ? (
        children
      ) : (
        <ClickSpark
          sparkColor="hsl(var(--accent))"
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
  )
}
