"use client"

import { useEffect } from "react"

export function useStableHashScroll(headerSelector: string = "header") {
    useEffect(() => {
        const id = typeof window !== "undefined" ? window.location.hash.replace("#", "") : ""
        if (!id) return

        const target = document.getElementById(id)
        if (!target) return

        const getHeaderOffset = () => {
            const header = document.querySelector(headerSelector) as HTMLElement | null
            return header?.getBoundingClientRect().height ?? 0
        }

        const EPS = 1           // acceptable px error from perfect alignment
        const STABLE_FRAMES = 6 // consecutive frames within EPS -> consider settled
        const MAX_FRAMES = 180  // hard timeout (~3s at 60fps)

        let raf = 0
        let ro: ResizeObserver | null = null
        let stable = 0
        let framesLeft = MAX_FRAMES
        let stopped = false

        const align = () => {
            if (stopped) return

            const headerOffset = getHeaderOffset()
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerOffset

            // Instant correction to avoid compounding drift with smooth scroll
            window.scrollTo({ top: Math.max(0, targetY), behavior: "auto" })

            const delta = target.getBoundingClientRect().top - headerOffset
            stable = Math.abs(delta) <= EPS ? (stable + 1) : 0

            if (stable < STABLE_FRAMES && --framesLeft > 0) {
                raf = requestAnimationFrame(align)
            }
        }

        // Kick once on next frame (after first paint)
        raf = requestAnimationFrame(align)

        // Re-align on any layout changes while settling
        ro = new ResizeObserver(() => {
            if (stopped) return
            stable = 0
            framesLeft = MAX_FRAMES
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(align)
        })
        ro.observe(document.body)

        // Final nudge once everything (images/fonts) reports loaded
        const onLoad = () => {
            if (stopped) return
            stable = 0
            framesLeft = 60
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(align)
        }
        window.addEventListener("load", onLoad, { once: true })

        // Stop if the user interacts (don't fight the user)
        const stop = () => {
            stopped = true
            cancelAnimationFrame(raf)
            ro?.disconnect()
            window.removeEventListener("load", onLoad)
            window.removeEventListener("pointerdown", stop)
            window.removeEventListener("wheel", stop, { passive: true } as any)
            window.removeEventListener("touchstart", stop, { passive: true } as any)
        }
        window.addEventListener("pointerdown", stop, { once: true })
        window.addEventListener("wheel", stop, { passive: true } as any)
        window.addEventListener("touchstart", stop, { passive: true } as any)

        return stop
    }, [])
}
