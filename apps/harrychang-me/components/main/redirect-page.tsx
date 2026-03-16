"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

interface RedirectPageProps {
  href: string
  label: string
}

export default function RedirectPage({ href, label }: RedirectPageProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - start), 10)

    const timeout = setTimeout(() => {
      clearInterval(timer)
      window.location.href = href
    }, 500)

    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [href])

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const cs = Math.floor((ms % 1000) / 10)
    return `${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`
  }

  return (
    <div
      style={{ top: "var(--header-offset, 64px)" }}
      className="fixed inset-x-0 bottom-0 z-50 bg-background flex items-center justify-center overflow-hidden select-none"
    >
      {/* Animated gradient loading bar — mirrors header */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] loading-bar"
        initial={{ x: "-100%", width: "18%" }}
        animate={{
          x: ["-100%", "600%"],
          width: ["18%", "28%", "18%"],
        }}
        transition={{
          x: { duration: 0.55, repeat: Infinity, ease: "linear" },
          width: {
            duration: 0.55,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
            times: [0, 0.5, 1],
          },
        }}
      />

      {/* Corner framelines — echoing 404 rangefinder & page transition */}
      <div className="absolute inset-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-foreground/40" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-foreground/40" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-foreground/40" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-foreground/40" />
      </div>

      {/* Central patch */}
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-80 h-24 border border-foreground/20 bg-foreground/[0.02] flex items-center justify-center overflow-hidden">
          {/* Split-line detail */}
          <div className="absolute inset-x-6 top-1/2 h-px bg-foreground/15" />
          <span className="font-mono text-xl tracking-[0.15em] uppercase text-foreground relative z-10 px-6">
            {label}
          </span>
        </div>

        {/* Count-up timer */}
        <span className="font-mono text-[12px] tracking-[0.25em] text-secondary tabular-nums">
          {fmt(elapsed)}
        </span>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-14 font-mono text-[10px] tracking-[0.35em] text-foreground/25 uppercase">
        <span className="flex items-center gap-2">
          <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full bg-foreground/40"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          Redirecting
        </span>
      </div>

      {/* Page identifier */}
      <div className="absolute top-14 font-mono text-[10px] tracking-[0.5em] text-foreground/20 uppercase">
        301 · Redirect
      </div>
    </div>
  )
}
