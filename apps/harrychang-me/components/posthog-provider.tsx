"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { getCookie, setCookie } from "@portfolio/lib/lib/cookies";
import { setAnalyticsInstance } from "@portfolio/lib/analytics";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const LAST_VISIT_COOKIE = "hc_last_visit";

function computeEntrySignals() {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const subdomain = host.startsWith("lab.") ? "lab" : "main";

  let daysSinceLastVisit = -1;
  let isReturning = false;
  const lastVisit = getCookie(LAST_VISIT_COOKIE);
  const now = Date.now();
  if (lastVisit) {
    const ms = now - parseInt(lastVisit, 10);
    if (!Number.isNaN(ms)) {
      daysSinceLastVisit = Math.max(0, Math.floor(ms / 86_400_000));
      isReturning = true;
    }
  }
  setCookie(LAST_VISIT_COOKIE, now.toString());

  const referrer = typeof document !== "undefined" ? document.referrer : "";
  const entryPath =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const entryType =
    entryPath === "/" ? "homepage" : referrer ? "deep_link" : "direct";

  // Read theme/locale from the same cookies the contexts use so the cold-load
  // $pageview already carries them — avoids attribution drift for returning
  // visitors whose preferences differ from defaults.
  const theme = getCookie("theme") || "dark";
  const locale = getCookie("language") || "en";

  return {
    subdomain,
    is_returning_visitor: isReturning,
    days_since_last_visit: daysSinceLastVisit,
    entry_type: entryType,
    theme,
    locale,
  };
}

function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;
  if (posthog.__loaded) return;

  // Compute super-properties synchronously BEFORE init so they're attached to
  // the very first $pageview emitted from inside the loaded callback.
  const entrySignals = computeEntrySignals();

  posthog.init(POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    loaded: (ph) => {
      ph.register(entrySignals);
      setAnalyticsInstance(ph);

      // Seed the cold-load $pageview here. PostHogPageviewInner skips its
      // first mount so we don't double-fire; route changes after init flow
      // through the inner component as normal.
      const url =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/";
      ph.capture("$pageview", { $current_url: url });

      if (entrySignals.is_returning_visitor) {
        ph.capture("repeat_session_detected", {
          days_since_last_visit: entrySignals.days_since_last_visit,
          entry_type: entrySignals.entry_type,
        });
      }
    },
  });
}

function PostHogPageviewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipFirstRef = useRef(true);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (!pathname) return;
    // Cold-load $pageview is fired from initPostHog's `loaded` callback
    // (which carries all super-properties). Skip the first mount here to
    // avoid double-firing; track route changes from the second render onward.
    if (skipFirstRef.current) {
      skipFirstRef.current = false;
      return;
    }
    if (!posthog.__loaded) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PostHogPageviewInner />
    </Suspense>
  );
}

export default function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      <PostHogPageview />
      {children}
    </>
  );
}
