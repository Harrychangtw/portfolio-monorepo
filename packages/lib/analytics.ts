"use client";

// Avoid a static import of `posthog-js` here so apps that never initialize
// PostHog (e.g. emilychang-me) don't pull the SDK into their bundle just
// because they share UI components from @portfolio/ui. The PostHog provider
// in the harrychang-me app calls `setAnalyticsInstance` after init.
type AnalyticsInstance = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  __loaded?: boolean;
};

let instance: AnalyticsInstance | null = null;

export function setAnalyticsInstance(ph: AnalyticsInstance | null): void {
  instance = ph;
}

/**
 * Thin wrapper around posthog.capture. No-ops if PostHog isn't initialized
 * (init lives in apps/harrychang-me/components/posthog-provider.tsx). Never
 * include sensitive user content in `properties` — guestbook text, form
 * values, email addresses, etc.
 */
export function track(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!instance || !instance.__loaded) return;
  instance.capture(event, properties);
  if (process.env.NODE_ENV !== "production") {
    // Surface tracked events in the dev console so the network-tab payload
    // (which is gzipped) doesn't have to be reverse-engineered to confirm
    // instrumentation.
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, properties);
  }
}

export const events = {
  // Navigation & discovery
  HEADER_NAV_LINK_CLICK: "header_nav_link_clicked",
  FOOTER_LINK_CLICK: "footer_link_clicked",
  LANGUAGE_SWITCHED: "language_switched",
  THEME_TOGGLED: "theme_toggled",
  GRAPH_NODE_CLICKED: "graph_node_clicked",
  NEXT_UP_CARD_CLICKED: "next_up_card_clicked",
  SEE_ALL_CLICKED: "see_all_clicked",

  // Content engagement
  BLOG_CARD_OPENED: "blog_card_opened",
  GALLERY_CARD_OPENED: "gallery_card_opened",
  PROJECT_CARD_CLICKED: "project_card_clicked",
  SCROLL_DEPTH_REACHED: "scroll_depth_reached",
  EXTERNAL_LINK_CLICKED: "external_link_clicked",

  // Interactive features
  GUESTBOOK_SUBMITTED: "guestbook_submitted",
  RANGEFINDER_FOCUSED: "rangefinder_focused",
  RANGEFINDER_LOCKED: "rangefinder_locked",
  RANGEFINDER_REDIRECTED: "rangefinder_redirected",
  SPOTIFY_WIDGET_CLICKED: "spotify_widget_clicked",
  CV_DOWNLOAD_CLICKED: "cv_download_clicked",
  MANIFESTO_REVEALED: "manifesto_revealed",

  // Returning-visitor signals
  REPEAT_SESSION_DETECTED: "repeat_session_detected",
  CONTENT_REVISITED: "content_revisited",
} as const;
