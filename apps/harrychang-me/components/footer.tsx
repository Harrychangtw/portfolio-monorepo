"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useNowPlaying } from "@portfolio/lib/hooks/use-now-playing";
import NowPlayingIndicator from "@portfolio/ui/now-playing-indicator";
import NowPlayingCard from "@portfolio/ui/now-playing-card";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@portfolio/lib/lib/scrolling";
import NavigationLink from "@portfolio/ui/navigation-link";
import GuestbookWidget from "@/components/guestbook-widget";
import { ArrowUpRight } from "lucide-react";
import { track, events } from "@portfolio/lib/analytics";

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false },
);

const ThemeSwitcher = dynamic(() => import("@portfolio/ui/theme-switcher"), {
  ssr: false,
});

// --- Reorganized Link Data ---
const connectLinks = [
  { id: "gmail", name: "Email", href: "/email" },
  { id: "discord", name: "Discord", href: "/discord" },
  { id: "linkedin", name: "LinkedIn", href: "/linkedin" },
  { id: "github", name: "GitHub", href: "/github" },
  { id: "telegram", name: "Telegram", href: "/telegram" },
  { id: "instagram", name: "Instagram", href: "/instagram" },
  { id: "medium", name: "Medium", href: "/medium" },
  { id: "calendar", name: "Schedule a Meeting", href: "/cal" },
];

const exploreLinks = [
  { id: "icarus", name: "Icarus Lab", href: "/icarus" },
  { id: "music", name: "Music Playlists", href: "/spotify" },
  { id: "letterboxd", name: "Letterboxd", href: "/letterboxd" },
  { id: "resume", name: "Resume", href: "/cv" },
  { id: "uses", name: "Uses", href: "/uses" },
  { id: "reading", name: "Paper Reading List", href: "/paper-reading" },
  { id: "design", name: "Design System", href: "/design" },
  { id: "graph", name: "Knowledge Graph", href: "/graph" },
];

const siteLinks = [
  { id: "about", name: "About", href: "/#about" },
  { id: "updates", name: "Updates", href: "/#updates" },
  { id: "projects", name: "Projects", href: "/#projects" },
  { id: "gallery", name: "Gallery", href: "/#gallery" },
  { id: "blog", name: "Blog", href: "/blog" },
  { id: "linktree", name: "Links", href: "/linktree" },
  { id: "manifesto", name: "Manifesto", href: "/manifesto" },
  { id: "source", name: "Source Code", href: "/readme" },
];

// Helper to get translation key based on link type
const getTranslationKey = (id: string) => {
  if (connectLinks.some((l) => l.id === id)) {
    return `social.${id}`;
  }
  if (exploreLinks.some((l) => l.id === id)) {
    // Map to existing translation keys
    const socialIds = ["music", "letterboxd"];
    if (socialIds.includes(id)) return `social.${id}`;
    return `resources.${id}`;
  }
  if (siteLinks.some((l) => l.id === id)) {
    const headerIds = ["about", "updates", "projects", "gallery", "blog"];
    if (headerIds.includes(id)) return `header.${id}`;
    return `resources.${id}`;
  }
  return id;
};

export default function Footer() {
  const isMobile = useIsMobile();
  const { t, tHtml } = useLanguage();
  const pathname = usePathname();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isLab, setIsLab] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

  const hoveringMusic = activeTooltipId === "music";
  const { data: nowPlaying } = useNowPlaying(hoveringMusic ? 10000 : 600000, {
    fresh: hoveringMusic,
  });

  const isMusicTooltip = hoveringMusic && nowPlaying?.isPlaying;

  useEffect(() => {
    setIsClient(true); // eslint-disable-line react-hooks/set-state-in-effect -- client detection on mount
    const hostname = window.location.hostname;
    setIsLab(hostname.startsWith("lab."));
  }, []);

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    if (!isMobile) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setActiveTooltipId(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && activeTooltipId) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveTooltipId(null);
    }
  };

  const isInternalLink = (href: string) => href.startsWith("/");
  const isAnchorLink = (href: string) => href.includes("#");

  const getHref = (href: string, id: string) => {
    if (!isClient) return href;

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : "";

    if (id === "icarus") {
      if (hostname.includes("localhost")) {
        return `${protocol}//lab.localhost${port}`;
      }
      const baseDomain = hostname.replace(/^lab\./, "").replace(/^www\./, "");
      return `${protocol}//lab.${baseDomain}`;
    }

    if (isLab && isInternalLink(href)) {
      let mainDomain = hostname.replace(/^lab\./, "");
      if (!mainDomain.includes("localhost") && !mainDomain.startsWith("www.")) {
        mainDomain = `www.${mainDomain}`;
      }
      return `${protocol}//${mainDomain}${port}${href}`;
    }

    return href;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (isLab) return;

    if (isAnchorLink(href) && pathname === "/") {
      const id = href.split("#")[1];
      if (id) scrollToSection(id, e);
    }
  };

  // Reusable link renderer
  const renderLink = (
    link: (typeof connectLinks)[0],
    showNowPlaying = false,
  ) => {
    const href = getHref(link.href, link.id);
    const isInternal = isInternalLink(link.href);
    const linkClassName = `font-ibm-plex text-primary transition-colors flex items-center justify-between w-full group ${
      link.id === "icarus" ? "icarus-link" : "hover:text-accent"
    }`;

    const label =
      showNowPlaying && link.id === "music" ? (
        <span className="inline-flex items-center">
          {t(getTranslationKey(link.id))}
          <NowPlayingIndicator isPlaying={nowPlaying?.isPlaying} />
        </span>
      ) : (
        t(getTranslationKey(link.id))
      );

    const linkContent = (
      <>
        <span>{label}</span>
        <ArrowUpRight className="w-4 h-4 text-secondary transition-all duration-300 group-hover:text-accent group-hover:translate-x-0.5" />
      </>
    );

    return (
      <li key={link.id}>
        <motion.div whileHover={{ y: -2, x: 4 }} transition={{ duration: 0.2 }}>
          {isInternal ? (
            <NavigationLink
              href={href}
              className={linkClassName}
              onClick={(e) => {
                track(events.FOOTER_LINK_CLICK, {
                  link_id: link.id,
                  link_type: "internal",
                  href: link.href,
                });
                if (link.id === "music") {
                  track(events.SPOTIFY_WIDGET_CLICKED, {
                    music_playing: !!nowPlaying?.isPlaying,
                  });
                }
                if (link.id === "gmail") {
                  track(events.EMAIL_COPIED, {});
                }
                if (link.id === "resume") {
                  track(events.CV_DOWNLOAD_CLICKED, { source: "footer" });
                }
                if (isAnchorLink(link.href)) handleNavClick(e, link.href);
              }}
              onMouseEnter={(e) => handleMouseEnter(e, link.id)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {linkContent}
            </NavigationLink>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              onClick={() =>
                track(events.FOOTER_LINK_CLICK, {
                  link_id: link.id,
                  link_type: "external",
                  href,
                })
              }
              onMouseEnter={(e) => handleMouseEnter(e, link.id)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {linkContent}
            </a>
          )}
        </motion.div>
      </li>
    );
  };

  return (
    <>
      <footer
        ref={footerRef}
        className="bg-card text-primary py-12 md:py-16 border-t border-border"
      >
        <div className="container">
          <div className="grid grid-cols-12 gap-y-10 md:gap-x-2 items-center">
            {/* Column 1: Logo & Motto */}
            <div className="col-span-12 md:col-span-6 md:pr-24 max-w-xl">
              <NavigationLink
                href={getHref("/", "logo")}
                className="relative h-12 mb-6 block cursor-pointer group"
                aria-label="Return to home page"
              >
                <Image
                  src="/chinese_name_icon.png"
                  alt="Harry Chang/Chi-Wei Chang 張祺煒 Logo"
                  width={357}
                  height={120}
                  className="object-contain transition-opacity group-hover:opacity-80 footer-logo"
                  priority
                  unoptimized
                  style={{ width: "auto", height: "48px" }}
                />
                <span className="sr-only">
                  Harry Chang/Chi-Wei Chang 張祺煒
                </span>
              </NavigationLink>
              <div className="font-ibm-plex text-base text-primary space-y-3">
                <p>{t("footer.motto1")}</p>
                <p>{tHtml("footer.motto2")}</p>
              </div>
              <div className="hidden md:flex items-center gap-6 mt-6">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            </div>

            {/* Link Columns */}
            <div className="col-span-12 md:col-span-6 space-y-10">
              <div className="w-full">
                <h3 className="section-label mb-4">{t("footer.guestbook")}</h3>
                <GuestbookWidget />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {/* Connect */}
                <div className="col-span-1">
                  <h3 className="section-label mb-4">
                    {t("footer.socialContact")}
                  </h3>
                  <ul className="space-y-3">
                    {connectLinks.map((link) => renderLink(link))}
                  </ul>
                </div>

                {/* Explore */}
                <div className="col-span-1">
                  <h3 className="section-label mb-4">
                    {t("footer.personalResources")}
                  </h3>
                  <ul className="space-y-3">
                    {exploreLinks.map((link) => renderLink(link, true))}
                  </ul>
                </div>

                {/* Site - Hidden on mobile, shown on md+ */}
                <div className="col-span-2 md:col-span-1 hidden md:block">
                  <h3 className="section-label mb-4">
                    {t("footer.siteNavigation")}
                  </h3>
                  <ul className="space-y-3">
                    {siteLinks.map((link) => renderLink(link))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Switches */}
          <div className="flex md:hidden items-center gap-6 mt-10">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </footer>

      {/* Tooltip */}
      {activeTooltipId && !isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50"
          style={
            isMusicTooltip
              ? {
                  top: tooltipPosition.y - 120,
                  left: tooltipPosition.x,
                  transform: "translate(15px, calc(-100% - 15px))",
                  pointerEvents: "none",
                }
              : {
                  top: tooltipPosition.y - 40,
                  left: tooltipPosition.x,
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }
          }
        >
          {isMusicTooltip ? (
            <NowPlayingCard
              key={nowPlaying?.songUrl ?? nowPlaying?.title ?? "np"}
              data={nowPlaying}
            />
          ) : (
            <div className="bg-accent text-background text-sm px-3 py-1.5 rounded-md shadow-lg font-heading">
              {t(`tooltips.${activeTooltipId}`)}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
