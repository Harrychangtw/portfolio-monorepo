"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import SiteHeader from "@portfolio/ui/site-header";

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

const SPECIAL_PAGES = [
  { prefix: "/paper-reading", key: "paperReading" },
  { prefix: "/manifesto", key: "manifesto" },
  { prefix: "/uses", key: "uses" },
  { prefix: "/linktree", key: "links" },
  { prefix: "/design", key: "design" },
  { prefix: "/cv", key: "cv" },
];

export default function Header() {
  const { t } = useLanguage();

  const connectItems = [
    { label: t("social.gmail"), link: "/email" },
    { label: t("social.linkedin"), link: "/linkedin" },
    { label: t("social.github"), link: "/github" },
    { label: t("social.instagram"), link: "/instagram" },
    { label: t("social.calendar"), link: "/cal" },
  ];

  const exploreItems = [
    { label: t("social.music"), link: "/spotify" },
    { label: t("social.letterboxd"), link: "/letterboxd" },
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
