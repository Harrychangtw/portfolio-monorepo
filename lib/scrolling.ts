// Define smooth scroll duration (keep consistent with header)
const SCROLL_ANIMATION_DURATION = 800; // ms

// Add user scroll detection
let userScrolling = false;
let scrollEndTimer: NodeJS.Timeout | null = null;

// Detect user scroll
if (typeof window !== 'undefined') {
  window.addEventListener('wheel', () => {
    userScrolling = true;
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      userScrolling = false;
    }, 150);
  }, { passive: true });
  
  window.addEventListener('touchmove', () => {
    userScrolling = true;
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      userScrolling = false;
    }, 150);
  }, { passive: true });
}

export const scrollToSection = (id: string, event?: React.MouseEvent) => {
  if (event) {
    event.preventDefault();
  }

  const element = document.getElementById(id);
  if (element) {
    const headerOffset = document.querySelector('header')?.offsetHeight || 0;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    // Dispatch event for loading the target section
    window.dispatchEvent(new CustomEvent("force-load-section", { detail: id }));
  }
};

// Helper function for precise alignment (from header)
export const ensurePreciseAlign = (id: string, duration = 1200): (() => void) => {
  const el = document.getElementById(id);
  if (!el) return () => {};

  const getHeaderH = () =>
    (document.querySelector("header") as HTMLElement | null)?.getBoundingClientRect().height || 0;

  const start = performance.now();
  let raf = 0;
  let lastDelta = Infinity;

  const step = () => {
    // Stop if user is scrolling
    if (userScrolling) {
      cancelAnimationFrame(raf);
      return;
    }

    const delta = el.getBoundingClientRect().top - getHeaderH();
    
    // Only adjust if delta is significant and not oscillating
    if (Math.abs(delta) > 0.5 && Math.abs(delta) < Math.abs(lastDelta)) {
      window.scrollBy({ top: delta, behavior: "auto" });
      lastDelta = delta;
    }
    
    if (performance.now() - start < duration && !userScrolling) {
      raf = requestAnimationFrame(step);
    }
  };

  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(step);
  
  // Return cleanup function
  return () => cancelAnimationFrame(raf);
};
