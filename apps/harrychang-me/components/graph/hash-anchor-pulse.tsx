"use client";

import { useEffect } from "react";
import { animate } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Reads window.location.hash on mount, on pathname change, and on hashchange,
 * and runs a brief highlight pulse on the matching element. Pairs with anchor
 * ids emitted by the markdown pipeline for graph image/section/video nodes.
 *
 * Scrolling is handled separately by useStableHashScroll on the global header.
 */
export default function HashAnchorPulse() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf1 = 0;
    let raf2 = 0;
    let cancelled = false;

    const pulse = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      // Two RAFs so the figure has been committed and laid out before we animate.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (cancelled) return;
          const target = document.getElementById(id);
          if (!target) return;
          animate(
            target,
            {
              boxShadow: [
                "0 0 0 0 hsl(var(--accent) / 0)",
                "0 0 0 8px hsl(var(--accent) / 0.35)",
                "0 0 0 0 hsl(var(--accent) / 0)",
              ],
            },
            { duration: 0.6, ease: "easeOut" },
          );
        });
      });
    };

    pulse();
    window.addEventListener("hashchange", pulse);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("hashchange", pulse);
    };
  }, [pathname]);

  return null;
}
