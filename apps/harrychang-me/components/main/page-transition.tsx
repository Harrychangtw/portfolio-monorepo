"use client";

import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Global page transition — zoom-out / zoom-in with a centred count-up timer.
 *
 * Phase machine:
 *   idle  →  out  (isNavigating becomes true)
 *   out   →  in   (isNavigating becomes false / route key changes)
 *   in    →  idle  (after zoom-in animation settles)
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigating } = useNavigation();

  const contentRef = useRef<HTMLDivElement>(null);
  const prevRouteKey = useRef<string | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const timerStartRef = useRef(0);
  const idleTimeoutRef = useRef<number | null>(null);
  const phaseRef = useRef<"idle" | "out" | "in">("idle");
  const minWaitRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [elapsed, setElapsed] = useState(0);

  const routeKey = `${pathname}?${searchParams.toString()}`;

  /* ── helpers ─────────────────────────────────────── */

  const stopTimer = () => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const cancelIdle = () => {
    if (idleTimeoutRef.current !== null) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  };

  const scheduleIdle = (delay: number) => {
    cancelIdle();
    idleTimeoutRef.current = window.setTimeout(() => {
      setPhase("idle");
      phaseRef.current = "idle";
      setElapsed(0);
      document.body.style.overflow = "";
      idleTimeoutRef.current = null;
    }, delay);
  };

  /* ── zoom out when navigating, zoom in when done ── */

  useEffect(() => {
    if (isNavigating) {
      cancelIdle();
      if (minWaitRef.current) {
        clearTimeout(minWaitRef.current);
        minWaitRef.current = null;
      }

      setPhase("out");
      phaseRef.current = "out";

      // Start count-up timer
      timerStartRef.current = Date.now();
      setElapsed(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsed(Date.now() - timerStartRef.current);
      }, 10);

      // Lock scrolling
      document.body.style.overflow = "hidden";
      return;
    }

    // Navigation ended (or was cancelled) while zoomed out
    if (phaseRef.current === "out") {
      const elapsedTime = Date.now() - timerStartRef.current;
      const MIN_WAIT = 250; // force a smooth pause before dropping in
      const remaining = Math.max(0, MIN_WAIT - elapsedTime);

      minWaitRef.current = window.setTimeout(() => {
        stopTimer();
        setPhase("in");
        phaseRef.current = "in";
        scheduleIdle(800);
      }, remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating]);

  /* ── scroll-to-top + entering animation on route change ── */

  useLayoutEffect(() => {
    if (prevRouteKey.current === null) {
      prevRouteKey.current = routeKey;
      return;
    }
    if (prevRouteKey.current === routeKey) return;
    prevRouteKey.current = routeKey;

    // Scroll to top for non-hash navigations
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    // Fallback entering animation (browsers without View Transitions API)

    // Fallback entering animation (browsers without View Transitions API)
    const el = contentRef.current;
    if (el && !(document as any).startViewTransition) {
      el.classList.remove("page-entering");
      void el.offsetWidth;
      el.classList.add("page-entering");
      el.addEventListener(
        "animationend",
        () => el.classList.remove("page-entering"),
        { once: true },
      );
    }
  }, [routeKey]);

  /* ── cleanup ── */

  useEffect(() => {
    return () => {
      stopTimer();
      cancelIdle();
      if (minWaitRef.current) clearTimeout(minWaitRef.current);
      document.body.style.overflow = "";
    };
  }, []);

  /* ── timer format: SS.cc ── */

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  return (
    <div className="page-transition-shell">
      {/* Zoomable content wrapper */}
      <div
        ref={contentRef}
        className="page-transition-content"
        data-phase={phase}
      >
        {children}
      </div>

      {/* Centre overlay — corner brackets + count-up timer */}
      <div
        className="page-transition-overlay-center"
        data-phase={phase}
        aria-hidden="true"
      >
        {/* Expanding backdrop frame — no children, so expansion causes zero child shifts */}
        <div className="reveal-frame">
          <div className="reveal-backdrop absolute inset-0 pointer-events-none" />
        </div>

        {/* Fixed-size decoration layer — positioned at viewport center, never changes size */}
        <div className="reveal-decorations">
          <div className="reveal-corner reveal-corner-tl absolute top-0 left-0 w-3 h-3 border-t border-l border-foreground/20" />
          <div className="reveal-corner reveal-corner-tr absolute top-0 right-0 w-3 h-3 border-t border-r border-foreground/20" />
          <div className="reveal-corner reveal-corner-bl absolute bottom-0 left-0 w-3 h-3 border-b border-l border-foreground/20" />
          <div className="reveal-corner reveal-corner-br absolute bottom-0 right-0 w-3 h-3 border-b border-r border-foreground/20" />
          <span className="reveal-timer absolute inset-0 z-10 flex items-center justify-center font-mono text-[12px] tracking-[0.25em] text-secondary tabular-nums">
            {fmt(elapsed)}
          </span>
        </div>
      </div>
    </div>
  );
}
