"use client"

let stopCurrent: (() => void) | null = null

export function stableScrollToId(
    id: string,
    { headerSelector = "header", setHash = true }: { headerSelector?: string; setHash?: boolean } = {}
): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve()

    if (stopCurrent) { stopCurrent(); stopCurrent = null }

    const el = document.getElementById(id)
    if (!el) return Promise.resolve()

    if (setHash) {
        const url = new URL(window.location.href)
        url.hash = `#${id}`
        history.replaceState(null, "", url) // update URL without firing hashchange
    }

    const getHeaderH = () => (document.querySelector(headerSelector)?.getBoundingClientRect().height ?? 0)

    const EPS = 1
    const STABLE_FRAMES = 6
    const MAX_FRAMES = 240 // ~4s

    let raf = 0
    let stable = 0
    let frames = 0
    let stopped = false

    return new Promise<void>((resolve) => {
        const cleanup = () => {
            if (stopped) return
            stopped = true
            cancelAnimationFrame(raf)
            ro.disconnect()
            window.removeEventListener("pointerdown", cleanup)
            window.removeEventListener("wheel", cleanup as any)
            window.removeEventListener("touchstart", cleanup as any)
            stopCurrent = null
            resolve()
        }

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
            } else {
                cleanup()
            }
        }

        const ro = new ResizeObserver(() => {
            stable = 0
            frames = Math.min(frames, MAX_FRAMES - 1)
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(step)
        })
        ro.observe(document.body)

        window.addEventListener("pointerdown", cleanup, { once: true })
        window.addEventListener("wheel", cleanup as any, { passive: true })
        window.addEventListener("touchstart", cleanup as any, { passive: true })

        stopCurrent = cleanup
        raf = requestAnimationFrame(step)
    })
}