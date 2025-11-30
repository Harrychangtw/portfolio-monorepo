"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile" 
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { useNowPlaying } from "@portfolio/lib/hooks/use-now-playing"
import NowPlayingIndicator from "@portfolio/ui/now-playing-indicator"
import NowPlayingCard from "@portfolio/ui/now-playing-card"
import { usePathname } from "next/navigation"
import { scrollToSection } from "@portfolio/lib/lib/scrolling"

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false }
)

// --- Reorganized Link Data ---
const connectLinks = [
  { id: 'gmail', name: 'Email', href: '/email' },
  { id: 'discord', name: 'Discord', href: '/discord' },
  { id: 'linkedin', name: 'LinkedIn', href: '/linkedin' },
  { id: 'github', name: 'GitHub', href: '/github' },
  { id: 'instagram', name: 'Instagram', href: '/instagram' },
  { id: 'calendar', name: 'Schedule a Meeting', href: '/cal' },
];

const exploreLinks = [
  { id: 'icarus', name: 'Icarus Lab', href: '/icarus' },
  { id: 'music', name: 'Music Playlists', href: '/spotify' },
  { id: 'letterboxd', name: 'Letterboxd', href: '/letterboxd' },
  { id: 'resume', name: 'Resume', href: '/cv' },
  { id: 'uses', name: 'Uses', href: '/uses' },
  { id: 'reading', name: 'Paper Reading List', href: '/paper-reading' },
];

const siteLinks = [
  { id: 'about', name: 'About', href: '/#about' },
  { id: 'updates', name: 'Updates', href: '/#updates' },
  { id: 'projects', name: 'Projects', href: '/#projects' },
  { id: 'gallery', name: 'Gallery', href: '/#gallery' },
  { id: 'manifesto', name: 'Manifesto', href: '/manifesto' },
  // { id: 'design', name: 'Design System', href: '/design' }, temporarily removed for balance
  { id: 'issues', name: 'Issues', href: '/issues' },
];

// For tooltip lookups
const allLinks = [...connectLinks, ...exploreLinks, ...siteLinks];

// Helper to get translation key based on link type
const getTranslationKey = (id: string) => {
  if (connectLinks.some(l => l.id === id)) {
    return `social.${id}`;
  }
  if (exploreLinks.some(l => l.id === id)) {
    // Map to existing translation keys
    const socialIds = ['music', 'letterboxd'];
    if (socialIds.includes(id)) return `social.${id}`;
    return `resources.${id}`;
  }
  if (siteLinks.some(l => l.id === id)) {
    const headerIds = ['about', 'updates', 'projects', 'gallery'];
    if (headerIds.includes(id)) return `header.${id}`;
    return `resources.${id}`;
  }
  return id;
};

export default function Footer() {
  const isMobile = useIsMobile();
  const { t, tHtml } = useLanguage()
  const pathname = usePathname();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isLab, setIsLab] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null)
  
  const hoveringMusic = activeTooltipId === 'music';
  const { data: nowPlaying } = useNowPlaying(hoveringMusic ? 5000 : 60000, {
    fresh: hoveringMusic,
  });
  
  const isMusicTooltip = hoveringMusic && nowPlaying?.isPlaying;

  useEffect(() => {
    setIsClient(true);
    const hostname = window.location.hostname;
    setIsLab(hostname.startsWith('lab.'));
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

  const isInternalLink = (href: string) => href.startsWith('/');
  const isAnchorLink = (href: string) => href.includes('#');

  const getHref = (href: string, id: string) => {
    if (!isClient) return href;

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    if (id === 'icarus') {
      if (hostname.includes('localhost')) {
        return `${protocol}//lab.localhost${port}`;
      }
      let baseDomain = hostname.replace(/^lab\./, '').replace(/^www\./, '');
      return `${protocol}//lab.${baseDomain}`;
    }

    if (isLab && isInternalLink(href)) {
      let mainDomain = hostname.replace(/^lab\./, '');
      if (!mainDomain.includes('localhost') && !mainDomain.startsWith('www.')) {
        mainDomain = `www.${mainDomain}`;
      }
      return `${protocol}//${mainDomain}${port}${href}`;
    }

    return href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isLab) return;
    
    if (isAnchorLink(href) && pathname === '/') {
      const id = href.split('#')[1];
      if (id) scrollToSection(id, e);
    }
  };

  // Reusable link renderer
  const renderLink = (link: typeof connectLinks[0], showNowPlaying = false) => (
    <li key={link.id}>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <a
          href={getHref(link.href, link.id)}
          {...(!isInternalLink(link.href) && {
            target: "_blank",
            rel: "noopener noreferrer"
          })}
          className={`font-ibm-plex text-primary transition-colors whitespace-nowrap ${
            link.id === 'icarus'
              ? 'icarus-link'
              : 'hover:text-[hsl(var(--accent))]'
          }`}
          onClick={isAnchorLink(link.href) ? (e) => handleNavClick(e, link.href) : undefined}
          onMouseEnter={(e) => handleMouseEnter(e, link.id)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {showNowPlaying && link.id === 'music' ? (
            <span className="inline-flex items-center">
              {t(getTranslationKey(link.id))}
              <NowPlayingIndicator isPlaying={nowPlaying?.isPlaying} />
            </span>
          ) : (
            t(getTranslationKey(link.id))
          )}
        </a>
      </motion.div>
    </li>
  );

  return (
    <>
      <style jsx global>{`
        .icarus-link:hover {
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          background-image: linear-gradient(60deg, #eaff4b, #3affa3, #4aa4d1, #3affa3, #eaff4b);
          background-size: 200% 100%;
          animation: gradient-loop 1s linear infinite;
        }

        @keyframes gradient-loop {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <footer ref={footerRef} className="bg-card text-primary py-12 md:py-16 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-12 gap-y-10 md:gap-x-2">

            {/* Column 1: Logo & Motto */}
            <div className="col-span-12 md:col-span-6 md:pr-24 md:mt-2 max-w-xl">
              <a 
                href={getHref('/', 'logo')} 
                className="relative h-12 mb-6 block cursor-pointer group"
                aria-label="Return to home page"
              >
                <Image
                  src="/chinese_name_icon.png"
                  alt="Harry Chang/Chi-Wei Chang 張祺煒 Logo"
                  width={357}
                  height={120}
                  className="object-contain transition-opacity group-hover:opacity-80"
                  priority
                  style={{ width: 'auto', height: '48px' }}
                />
                <span className="sr-only">Harry Chang/Chi-Wei Chang 張祺煒</span>
              </a>
              <div className="font-ibm-plex text-base text-primary space-y-3">
                <p>{t('footer.motto1')}</p>
                <p>{tHtml('footer.motto2')}</p>
              </div>
            </div>

            {/* Link Columns */}
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                
                {/* Connect */}
                <div className="col-span-1">
                  <h3 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">
                    {t('footer.socialContact')}
                  </h3>
                  <ul className="space-y-3">
                    {connectLinks.map(link => renderLink(link))}
                  </ul>
                </div>

                {/* Explore */}
                <div className="col-span-1">
                  <h3 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">
                    {t('footer.personalResources')}
                  </h3>
                  <ul className="space-y-3">
                    {exploreLinks.map(link => renderLink(link, true))}
                  </ul>
                </div>

                {/* Site - Hidden on mobile, shown on md+ */}
                <div className="col-span-2 md:col-span-1 hidden md:block">
                  <h3 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">
                    {t('footer.siteNavigation')}
                  </h3>
                  <ul className="space-y-3">
                    {siteLinks.map(link => renderLink(link))}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-secondary mt-16 mb-10 md:mt-16 md:mb-4" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-4 text-sm text-secondary">
            <LanguageSwitcher />
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              © {new Date().getFullYear()} Chi-Wei Chang. All rights reserved.
            </p>
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
                  transform: 'translate(15px, calc(-100% - 15px))',
                  pointerEvents: 'none',
                }
              : {
                  top: tooltipPosition.y - 40,
                  left: tooltipPosition.x,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }
          }
        >
          {isMusicTooltip ? (
            <NowPlayingCard key={nowPlaying?.songUrl ?? nowPlaying?.title ?? 'np'} data={nowPlaying} />
          ) : (
            <div className="bg-[hsl(var(--accent))] text-black text-sm px-3 py-1.5 rounded-md shadow-lg font-heading">
              {t(`tooltips.${activeTooltipId}`)}
            </div>
          )}
        </motion.div>
      )}
    </>
  )
}
