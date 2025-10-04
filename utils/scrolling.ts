// Define smooth scroll duration (keep consistent with header)
const SCROLL_ANIMATION_DURATION = 800; // ms

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
export const ensurePreciseAlign = (id: string, duration = 1200) => {
  const el = document.getElementById(id);
  if (!el) return;

  const getHeaderH = () =>
    (document.querySelector("header") as HTMLElement | null)?.getBoundingClientRect().height || 0;

  const start = performance.now();
  let raf = 0;

  const step = () => {
    const delta = el.getBoundingClientRect().top - getHeaderH();
    if (Math.abs(delta) > 0.5) {
      window.scrollBy({ top: delta, behavior: "auto" });
    }
    if (performance.now() - start < duration) {
      raf = requestAnimationFrame(step);
    }
  };

  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(step);
};
