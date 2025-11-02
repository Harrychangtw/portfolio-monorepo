"use client"

import type React from "react"
import { Suspense } from "react"
import Header from "@/components/header"
import { Analytics } from "@vercel/analytics/react"
import ClickSpark from "@/components/ui/click-spark"
import { useIsMobile } from "@/hooks/use-mobile"
import { LanguageProvider } from "@/contexts/LanguageContext"
import VideoInitializer from "@/components/video-initializer"
import NotificationProvider from "@/components/notification-provider"
import { useStableAnchor } from "@/hooks/use-stable-anchor"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsMobile()

  useStableAnchor(["projects", "gallery"], "header")

  return (
    <LanguageProvider>
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
      <Suspense fallback={null}>
        <NotificationProvider />
      </Suspense>
      <Analytics />
    </LanguageProvider>
  )
}

