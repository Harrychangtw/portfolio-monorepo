"use client"

import { useNavigation } from "@portfolio/lib/contexts/navigation-context"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"

const OVERLAY_RESET_DELAY = 260

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isNavigating } = useNavigation()

  const ref = useRef<HTMLDivElement>(null)
  const prevRouteKey = useRef<string | null>(null)
  const overlayTimerRef = useRef<number | null>(null)

  const [overlayState, setOverlayState] = useState<"idle" | "covering" | "revealing">("idle")

  const routeKey = `${pathname}?${searchParams.toString()}`

  useEffect(() => {
    if (isNavigating) {
      if (overlayTimerRef.current !== null) {
        window.clearTimeout(overlayTimerRef.current)
        overlayTimerRef.current = null
      }

      setOverlayState("covering")
      return
    }

    if (overlayState === "covering") {
      setOverlayState("idle")
    }
  }, [isNavigating, overlayState])

  useLayoutEffect(() => {
    if (prevRouteKey.current === null) {
      prevRouteKey.current = routeKey
      return
    }

    if (prevRouteKey.current === routeKey) {
      return
    }

    prevRouteKey.current = routeKey

    // Only force top for real page changes without a hash target.
    // Hash-based navigation is handled elsewhere by the stable hash scroll logic.
    if (!window.location.hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    const el = ref.current
    if (el && !document.startViewTransition) {
      el.classList.remove("page-entering")
      // Force reflow so the class re-triggers the animation
      void el.offsetWidth
      el.classList.add("page-entering")

      const onEnd = () => el.classList.remove("page-entering")
      el.addEventListener("animationend", onEnd, { once: true })
    }

    setOverlayState("revealing")

    if (overlayTimerRef.current !== null) {
      window.clearTimeout(overlayTimerRef.current)
    }

    overlayTimerRef.current = window.setTimeout(() => {
      setOverlayState("idle")
      overlayTimerRef.current = null
    }, OVERLAY_RESET_DELAY)
  }, [routeKey])

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current !== null) {
        window.clearTimeout(overlayTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="page-transition-shell" data-nav-overlay={overlayState}>
      <div ref={ref} style={{ minHeight: 0 }}>
        {children}
      </div>
      <div aria-hidden="true" className="page-transition-overlay" />
    </div>
  )
}
