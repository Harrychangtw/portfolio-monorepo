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

  const connectItems = [
    { label: t("social.gmail"), link: "/email" },
    { label: t("social.linkedin"), link: "/linkedin" },
    { label: t("social.github"), link: "/github" },
    { label: t("social.instagram"), link: "/instagram" },
    { label: t("social.booking"), link: "/meet" },
  ];

  const exploreItems = [
    { label: t("social.music"), link: "/spotify" },
    { label: t("social.letterboxd"), link: "/letterboxd" },
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
