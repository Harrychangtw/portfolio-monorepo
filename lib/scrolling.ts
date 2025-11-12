// Define smooth scroll duration (keep consistent with header)
const SCROLL_ANIMATION_DURATION = 800; // ms

// Easing function for smooth scroll animation
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const scrollToSection = (id: string, event?: React.MouseEvent) => {
  if (event) {
    event.preventDefault();
  }

  const element = document.getElementById(id);
  if (!element) return;

  const headerOffset = document.querySelector("header")?.offsetHeight || 0;
  const startPosition = window.pageYOffset;
  const targetPosition = element.getBoundingClientRect().top + startPosition - headerOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;
  let rafId: number;

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("wheel", cleanup);
    window.removeEventListener("touchstart", cleanup);
  };

  window.addEventListener("wheel", cleanup, { once: true, passive: true });
  window.addEventListener("touchstart", cleanup, { once: true, passive: true });

  const animationStep = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / SCROLL_ANIMATION_DURATION, 1);

    window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));

    if (timeElapsed < SCROLL_ANIMATION_DURATION) {
      rafId = requestAnimationFrame(animationStep);
    } else {
      cleanup();
    }
  };

  window.dispatchEvent(new CustomEvent("force-load-section", { detail: id }));
  rafId = requestAnimationFrame(animationStep);
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
  };

  window.addEventListener("wheel", cleanup, { once: true, passive: true });
  window.addEventListener("touchstart", cleanup, { once: true, passive: true });

  const start = performance.now();

  const step = () => {
    const delta = el.getBoundingClientRect().top - getHeaderH();

    if (performance.now() - start > duration || Math.abs(delta) < 0.5) {
      cleanup();
      return;
    }

    window.scrollBy({ top: delta, behavior: "auto" });
    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
};
