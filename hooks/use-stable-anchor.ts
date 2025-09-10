"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function useStableAnchor(
    targets: string[] = ["projects", "gallery"],
    headerSelector: string = "header"
) {
    const pathname = usePathname()

    useEffect(() => {
        if (typeof window === "undefined") return

        // Ensure the browser doesn't restore to an imprecise position on back
        try { window.history.scrollRestoration = "manual" } catch {}

        const alignIfNeeded = () => {
            const hash = window.location.hash.replace("#", "")
            if (!hash || !targets.includes(hash)) return

            const el = document.getElementById(hash)
            if (!el) return

            const getHeaderH = () => {
                const header = document.querySelector(headerSelector) as HTMLElement | null
                return header?.getBoundingClientRect().height ?? 0
            }

            const EPS = 1
            const STABLE_FRAMES = 6
            const MAX_FRAMES = 240 // ~4s at 60fps

            let raf = 0
            let stable = 0
            let frames = 0
            let stopped = false

            const step = () => {
                if (stopped) return
                const headerH = getHeaderH()
                const delta = el.getBoundingClientRect().top - headerH

                if (Math.abs(delta) > EPS) {
                    window.scrollTo({ top: window.scrollY + delta, behavior: "auto" })
                    stable = 0
                } else {
                    stable++
                }

                frames++
                if (stable < STABLE_FRAMES && frames < MAX_FRAMES) {
                    raf = requestAnimationFrame(step)
                }
            }

            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(step)

            const ro = new ResizeObserver(() => {
                stable = 0
                frames = Math.min(frames, MAX_FRAMES - 1)
                cancelAnimationFrame(raf)
                raf = requestAnimationFrame(step)
            })
            ro.observe(document.body)

            const stop = () => {
                stopped = true
                cancelAnimationFrame(raf)
                ro.disconnect()
                window.removeEventListener("pointerdown", stop)
                window.removeEventListener("wheel", stop as any)
                window.removeEventListener("touchstart", stop as any)
            }
            window.addEventListener("pointerdown", stop, { once: true })
            window.addEventListener("wheel", stop as any, { passive: true })
            window.addEventListener("touchstart", stop as any, { passive: true })
        }

        // Initial mount (direct visit like /#projects or /#gallery)
        alignIfNeeded()

        // On hash changes (e.g., programmatic hash updates)
        const onHash = () => alignIfNeeded()
        window.addEventListener("hashchange", onHash)

        // On back/forward (returning from detail pages)
        const onPop = () => alignIfNeeded()
        window.addEventListener("popstate", onPop)

        return () => {
            window.removeEventListener("hashchange", onHash)
            window.removeEventListener("popstate", onPop)
        }
    }, [pathname, targets.join("|"), headerSelector])
}