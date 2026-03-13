"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** CSS-pixel block sizes, largest → smallest (6 steps × 1000 ms = 6 000 ms) */
const PIXEL_STEPS = [256, 64, 16, 4, 2, 1] as const
const STEP_MS = 300

interface PixelateLoaderProps {
  /** The tiny thumbnail URL produced by the image pipeline */
  thumbnailSrc: string | undefined
  /** false = fade canvas out (full image is ready) */
  shown: boolean
  /** Match the full <Image> object-fit strategy */
  objectFit?: "cover" | "contain"
}

export function PixelateLoader({
  thumbnailSrc,
  shown,
  objectFit = "cover",
}: PixelateLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef   = useRef<HTMLImageElement | null>(null)
  const [stepIndex, setStepIndex] = useState(-1) // -1 = waiting for thumbnail

  // ── Load the thumbnail once ──────────────────────────────────────────────
  useEffect(() => {
    if (!thumbnailSrc) return
    setStepIndex(-1)
    imgRef.current = null

    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      setStepIndex(0)
    }
    img.src = thumbnailSrc
  }, [thumbnailSrc])

  // ── Draw one pixelated frame ─────────────────────────────────────────────
  const drawPixelated = useCallback(
    (blockSize: number) => {
      const canvas = canvasRef.current
      const img    = imgRef.current
      if (!canvas || !img) return

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return

      // Sync backing-store size to CSS display size
      canvas.width  = w
      canvas.height = h

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // ── 1. Tiny offscreen canvas (low res) ──────────────────────────────
      const smallW = Math.max(1, Math.round(w / blockSize))
      const smallH = Math.max(1, Math.round(h / blockSize))

      const off    = document.createElement("canvas")
      off.width    = smallW
      off.height   = smallH
      const offCtx = off.getContext("2d")
      if (!offCtx) return
      offCtx.imageSmoothingEnabled = false

      const iW = img.naturalWidth
      const iH = img.naturalHeight

      if (objectFit === "cover") {
        // Centre-crop source to match canvas aspect ratio
        let sx = 0, sy = 0, sw = iW, sh = iH
        if (iW / iH > w / h) {
          sw = iH * (w / h)
          sx = (iW - sw) / 2
        } else {
          sh = iW / (w / h)
          sy = (iH - sh) / 2
        }
        offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, smallW, smallH)
      } else {
        // Contain: letterbox inside the small canvas
        const scale = Math.min(smallW / iW, smallH / iH)
        const dw    = Math.round(iW * scale)
        const dh    = Math.round(iH * scale)
        const dx    = Math.round((smallW - dw) / 2)
        const dy    = Math.round((smallH - dh) / 2)
        offCtx.drawImage(img, 0, 0, iW, iH, dx, dy, dw, dh)
      }

      // ── 2. Upscale to full canvas — no smoothing = block pixels ─────────
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(off, 0, 0, w, h)
    },
    [objectFit],
  )

  // ── Advance one step every STEP_MS ───────────────────────────────────────
  useEffect(() => {
    if (stepIndex < 0 || stepIndex >= PIXEL_STEPS.length) return
    drawPixelated(PIXEL_STEPS[stepIndex])
    const t = setTimeout(() => setStepIndex((s) => s + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [stepIndex, drawPixelated])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 z-10 ${
        shown && stepIndex >= 0 ? "opacity-100" : "opacity-0"
      }`}
    />
  )
}
