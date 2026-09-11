"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useStableHashScroll(headerSelector: string = "header") {
  // Deliberately does NOT call useSearchParams(). This hook runs in the site
  // header, which sits above every page, and useSearchParams() would opt the
  // enclosing Suspense boundary out of static prerendering — shipping an empty
  // <body> for the whole site. It was only ever an effect dependency here (the
  // effect body reads window.location.hash directly), and query-string changes
  // that move content are already picked up by the ResizeObserver below.
  const pathname = usePathname();

  // The effect captures its target element from the fragment, so it has to
  // re-run when the fragment changes. usePathname() does not report that, and
  // useSearchParams() never did either — it tracks the query string, so a
  // same-path #a -> #b navigation was already missed. Listening for hashchange
  // closes that properly, without pulling the prerender bailout back in.
  const [hashTick, setHashTick] = useState(0);
  useEffect(() => {
    const onHashChange = () => setHashTick((n) => n + 1);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? window.location.hash.replace("#", "")
        : "";
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    const getHeaderOffset = () => {
      const header = document.querySelector(
        headerSelector,
      ) as HTMLElement | null;
      return header?.getBoundingClientRect().height ?? 0;
    };

    const EPS = 1; // acceptable px error from perfect alignment
    const STABLE_FRAMES = 6; // consecutive frames within EPS -> consider settled
    const MAX_FRAMES = 180; // hard timeout (~3s at 60fps)

    let raf = 0;
    let ro: ResizeObserver | null = null;
    let stable = 0;
    let framesLeft = MAX_FRAMES;
    let stopped = false;

    const align = () => {
      if (stopped) return;

      const headerOffset = getHeaderOffset();
      const targetY =
        target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      // Instant correction to avoid compounding drift with smooth scroll
      window.scrollTo({ top: Math.max(0, targetY), behavior: "auto" });

      const delta = target.getBoundingClientRect().top - headerOffset;
      stable = Math.abs(delta) <= EPS ? stable + 1 : 0;

      if (stable < STABLE_FRAMES && --framesLeft > 0) {
        raf = requestAnimationFrame(align);
      }
    };

    // Kick once on next frame (after first paint)
    raf = requestAnimationFrame(align);

    // Re-align on any layout changes while settling
    ro = new ResizeObserver(() => {
      if (stopped) return;
      stable = 0;
      framesLeft = MAX_FRAMES;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(align);
    });
    ro.observe(document.body);

    // Final nudge once everything (images/fonts) reports loaded
    const onLoad = () => {
      if (stopped) return;
      stable = 0;
      framesLeft = 60;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(align);
    };
    window.addEventListener("load", onLoad, { once: true });

    // Stop if the user interacts (don't fight the user)
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pointerdown", stop as EventListener);
      window.removeEventListener("wheel", stop as EventListener);
      window.removeEventListener("touchstart", stop as EventListener);
    };
    window.addEventListener("pointerdown", stop as EventListener, {
      once: true,
    });
    window.addEventListener("wheel", stop as EventListener, { passive: true });
    window.addEventListener("touchstart", stop as EventListener, {
      passive: true,
    });

    return stop;
  }, [pathname, hashTick]);
}
