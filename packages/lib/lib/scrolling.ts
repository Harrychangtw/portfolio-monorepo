// Keep duration in sync with header
const SCROLL_ANIMATION_DURATION = 400; // ms

// Easing unchanged
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

// Optional: one global stopper so multiple calls don't fight each other
let activeScrollStop: (() => void) | null = null;

export const scrollToSection = (id: string, event?: React.MouseEvent) => {
    if (event) event.preventDefault();

    const el = document.getElementById(id);
    if (!el) return;

    // Hint the section to load ASAP (minimize layout shift)
    window.dispatchEvent(new CustomEvent("force-load-section", { detail: id }));

    // Cancel any previous scroll
    activeScrollStop?.();

    const startY = window.pageYOffset;
    const headerAtStart = document.querySelector("header")?.getBoundingClientRect().height || 0;
    const initialTarget = el.getBoundingClientRect().top + startY - headerAtStart;

    let rafId = 0;
    let startTime: number | null = null;
    let stopped = false;

    const stop = () => {
        if (stopped) return;
        stopped = true;
        cancelAnimationFrame(rafId);
        window.removeEventListener("wheel", stop as any);
        window.removeEventListener("touchstart", stop as any);
        window.removeEventListener("pointerdown", stop as any);
    };
    activeScrollStop = stop;

    // Fully interruptible by user input
    window.addEventListener("wheel", stop as any, { passive: true, once: true });
    window.addEventListener("touchstart", stop as any, { passive: true, once: true });
    window.addEventListener("pointerdown", stop as any, { passive: true, once: true });

    const step = (now: number) => {
        if (stopped) return;

        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / SCROLL_ANIMATION_DURATION, 1);
        const eased = easeInOutQuad(t);

        // Recalculate live target to compensate for layout shifts
        const headerNow = document.querySelector("header")?.getBoundingClientRect().height || 0;
        const currentY = window.pageYOffset;
        const liveTarget = el.getBoundingClientRect().top + currentY - headerNow;

        // Follow the original path but add the shift delta so we land precisely
        const baseY = startY + (initialTarget - startY) * eased;
        const shift = liveTarget - initialTarget;
        const nextY = baseY + shift;

        window.scrollTo(0, Math.max(0, nextY));

        if (t < 1) {
            rafId = requestAnimationFrame(step);
        } else {
            stop();
            // Final micro-align to reach perfect pixel alignment while content still settles
            ensurePreciseAlign(id, 800);
        }
    };

    rafId = requestAnimationFrame(step);
};

// Helper function for precise alignment (from header)
export const ensurePreciseAlign = (id: string, duration = 1200) => {
  const el = document.getElementById(id);
  if (!el) return;

  let rafId: number;
  const getHeaderH = () =>
    (document.querySelector("header") as HTMLElement | null)?.getBoundingClientRect().height || 0;

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("wheel", cleanup);
    window.removeEventListener("touchstart", cleanup);
    window.removeEventListener("pointerdown", cleanup as any);
  };

  window.addEventListener("wheel", cleanup, { once: true, passive: true });
  window.addEventListener("touchstart", cleanup, { once: true, passive: true });
  window.addEventListener("pointerdown", cleanup as any, { once: true, passive: true });

  const start = performance.now();

  const step = () => {
    const delta = el.getBoundingClientRect().top - getHeaderH();

    if (performance.now() - start > duration || Math.abs(delta) < 0.5) {
      cleanup();
      return;
    }

    window.scrollBy({ top: delta * 0.35, behavior: "auto" });
    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
};
