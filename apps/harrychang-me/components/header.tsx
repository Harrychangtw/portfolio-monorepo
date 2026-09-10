"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import SiteHeader from "@portfolio/ui/site-header";
import { siteConfig } from "@/config/site";

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false },
);
const ThemeSwitcher = dynamic(() => import("@portfolio/ui/theme-switcher"), {
  ssr: false,
});

const NAV_ITEMS = [
  { id: "about", path: "/" },
  { id: "updates", path: "/#updates" },
  { id: "projects", path: "/#projects" },
  { id: "gallery", path: "/#gallery" },
  { id: "blog", path: "/#blog" },
];

const LAB_HOSTNAMES = (() => {
  try {
    return ["lab.localhost", new URL(siteConfig.labUrl).hostname];
  } catch {
    return ["lab.localhost"];
  }
})();

const SPECIAL_PAGES = [
  { prefix: "/paper-reading", key: "paperReading" },
  { prefix: "/manifesto", key: "manifesto" },
  { prefix: "/uses", key: "uses" },
  { prefix: "/linktree", key: "links" },
  { prefix: "/cal", key: "calendar" },
  { prefix: "/design", key: "design" },
  { prefix: "/cv", key: "cv" },
  { prefix: "/privacy", key: "privacy" },
];

export default function Header() {
  const { t } = useLanguage();

  // `external` marks redirect routes that leave the app, so they render as
  // plain anchors instead of firing the client-side route transition.
  const connectItems = [
    // /email redirects to a mailto:, so a new tab would be left behind empty.
    { label: t("social.gmail"), link: "/email", external: true, newTab: false },
    { label: t("social.linkedin"), link: "/linkedin", external: true },
    { label: t("social.github"), link: "/github", external: true },
    { label: t("social.instagram"), link: "/instagram", external: true },
    { label: t("social.discord"), link: "/discord", external: true },
    { label: t("social.telegram"), link: "/telegram", external: true },
  ];

  const exploreItems = [
    { label: t("social.music"), link: "/spotify", external: true },
    { label: t("social.letterboxd"), link: "/letterboxd", external: true },
    { label: t("resources.calendar"), link: "/cal" },
    { label: t("resources.resume"), link: "/cv" },
    { label: t("resources.design"), link: "/design" },
    { label: t("resources.graph"), link: "/graph" },
  ];

  return (
    <SiteHeader
      brandName="Harry Chang"
      brandHref="/"
      brandVariant="plain"
      navItems={NAV_ITEMS}
      showLoadingStatus
      enableLabDomain
      labHostnames={LAB_HOSTNAMES}
      specialPages={SPECIAL_PAGES}
      showMoreNav
      readingProgressMatchers={[/^\/projects\/[^/]+$/, /^\/blog\/[^/]+$/]}
      staggeredMenu={{
        accentColor: "hsl(var(--accent))",
        menuButtonColor: "hsl(var(--foreground))",
        openMenuButtonColor: "hsl(var(--foreground))",
        socialGroups: [
          {
            titleKey: "footer.socialContact",
            fallbackTitle: "Social & Contact",
            items: connectItems,
          },
          {
            titleKey: "footer.personalResources",
            fallbackTitle: "Resources",
            items: exploreItems,
          },
        ],
        bottomSlot: (
          <>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </>
        ),
      }}
    />
  );
}
