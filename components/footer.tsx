"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useIsMobile } from "@/hooks/use-mobile" 
import { useLanguage } from "@/contexts/LanguageContext"
import { useNowPlaying } from "@/hooks/use-now-playing"
import NowPlayingIndicator from "@/components/now-playing-indicator"
import NowPlayingCard from "@/components/now-playing-card"
import { usePathname } from "next/navigation"
import { scrollToSection } from "@/utils/scrolling"

const LanguageSwitcher = dynamic(
  () => import("@/components/language-switcher"),
  { ssr: false }
)

// --- Link Data ---
const navigationLinks = [
  { id: 'about', name: 'About', href: '/#about', tooltip: 'Learn about me' },
  { id: 'updates', name: 'Updates', href: '/#updates', tooltip: 'Latest happenings' },
  { id: 'projects', name: 'Projects', href: '/#projects', tooltip: 'Things I\'ve built' },
  { id: 'gallery', name: 'Gallery', href: '/#gallery', tooltip: 'Visual showcase' },
];

const socialLinks = [
  { id: 'gmail', name: 'Email', href: 'mailto:chiwei@harrychang.me', tooltip: 'Always happy for a chat!' },
  { id: 'discord', name: 'Discord', href: 'https://discord.com/users/836567989209661481', tooltip: 'Ping me, maybe I\'ll ping back' },
  { id: 'github', name: 'GitHub', href: 'https://github.com/Harrychangtw', tooltip: 'Check out my GitHub—where repos go to hide' },
  { id: 'instagram', name: 'Instagram', href: 'https://www.instagram.com/pomelo_chang_08/', tooltip: 'Please stalk responsibly' },
  { id: 'letterboxd', name: 'Letterboxd', href: 'https://boxd.it/fSKuF', tooltip: 'Judge my movie tastes harshly.' }, // Placeholder href
];

const resourceLinks = [
  { id: 'resume', name: 'Resume', href: 'https://drive.google.com/file/d/16ExSDKuP11pWGbuASE2vaiosskUDOZR_/view?usp=sharing', tooltip: 'Proof I know how to adult' },
  { id: 'calendar', name: 'Schedule a Meeting', href: 'https://calendar.notion.so/meet/harry-chang/ybit2gkx', tooltip: 'Book a time to chat with me' },
  { id: 'manifesto', name: 'Manifesto', href: '/manifesto', tooltip: 'A bridge back to naiveté' },
  // { id: 'wallpapers', name: 'Wallpapers', href: 'https://photos.google.com/u/1/share/AF1QipN_xATdICaaIO4RzR5CzdIj6AFeoueQmu5100b-a9_QIAzGLhz4HD95OurMi8pqBQ?key=MnV1OGlrQUdRTUg3Y0FHSkdnYVZrOXNMOU1PWFpn', tooltip: 'Spent way too much time on these...' },
  { id: 'uses', name: 'Uses', href: '/uses', tooltip: 'My tools & setup' },
  { id: 'music', name: 'Music Playlists', href: 'https://open.spotify.com/user/1b7kc6j0zerk49mrv80pwdd96?si=7d5a6e1a4fa34de3' },
  { id: 'reading', name: 'Paper Reading List', href: '/paper-reading', tooltip: 'Caffeine-fueled knowledge' },
];

const allLinks = [...socialLinks, ...resourceLinks];


export default function Footer() {
  const isMobile = useIsMobile();
  const { t, tHtml } = useLanguage()
  const pathname = usePathname();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showManifesto, setShowManifesto] = useState(true); 
  const [isClient, setIsClient] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null)
  
  const hoveringMusic = activeTooltipId === 'music';
  const { data: nowPlaying } = useNowPlaying(hoveringMusic ? 5000 : 60000, {
    fresh: hoveringMusic,
  });
  
  const isMusicTooltip = hoveringMusic && nowPlaying?.isPlaying;

  useEffect(() => {
    setIsClient(true);
    const checkWidth = () => {
      setShowManifesto(window.innerWidth >= 800);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Dynamically set --footer-h to the actual footer height
  useEffect(() => {
    if (!footerRef.current) return
    const el = footerRef.current

    const setH = () => {
      const h = Math.round(el.getBoundingClientRect().height)
      // set on <html> so it applies globally
      document.documentElement.style.setProperty('--footer-h', `${h}px`)
    }

    setH()
    const ro = new ResizeObserver(setH)
    ro.observe(el)
    window.addEventListener('resize', setH)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setH)
    }
  }, [])

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
  
  const filteredResourceLinks = resourceLinks.filter(link => link.id !== 'manifesto' || showManifesto);

  // Helper function to determine if a link is internal
  const isInternalLink = (href: string) => {
    return href.startsWith('/');
  };

  // NEW: Click handler for navigation links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if it's a hash link and we're on the home page
    if (href.includes('#') && pathname === '/') {
      const id = href.split('#')[1];
      if (id) {
        scrollToSection(id, e);
      }
    }
    // For other links, let Next.js handle the navigation
  };

  return (
    <>
      <footer
        ref={footerRef}
        className="reveal-footer bg-[#1a1a1a] text-primary py-12 md:py-16 border-t border-border sticky bottom-0 z-[1]"
      >
        <div className="container">
          <div className="grid grid-cols-12 gap-y-10 md:gap-x-2">

            {/* Column 1: Logo & Motto */}
            <div className="col-span-12 md:col-span-6 md:pr-24 md:mt-2 max-w-xl">
              {/* --- Logo with increased dimensions --- */}
              <div className="relative h-12 mb-6">
                <Image
                  src="/chinese_name_icon.png"
                  alt="Harry Chang/Chi-Wei Chang 張祺煒 Logo"
                  width={357}
                  height={120}
                  className="object-contain"
                  priority
                  style={{ width: 'auto', height: '48px' }}
                />
                <span className="sr-only">Harry Chang/Chi-Wei Chang 張祺煒</span>
              </div>
              <div className="font-ibm-plex text-base text-primary space-y-3">
                <p>{t('footer.motto1')}</p>
                <p>
                  {tHtml('footer.motto2')}
                </p>
              </div>
            </div>

            {/* Columns 2, 3, & 4 Wrapper - Aligns with the "Roles & Description" columns */}
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-12 gap-y-10 sm:gap-x-4">
                
                {/* Column 2: Social & Contact - Aligns with "Roles" */}
                <div className="col-span-12 sm:col-span-4 pr-8">
                  <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4 whitespace-nowrap">
                    {t('footer.socialContact')}
                  </h3>
                  <ul className="space-y-3">
                    {socialLinks.map(link => (
                      <li key={link.id}>
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                          <a
                            href={link.href}
                            {...(!isInternalLink(link.href) && {
                              target: "_blank",
                              rel: "noopener noreferrer"
                            })}
                            className="font-ibm-plex text-primary hover:text-[#D8F600] transition-colors whitespace-nowrap"
                            onMouseEnter={(e) => handleMouseEnter(e, link.id)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t(`social.${link.id}`)}
                          </a>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Personal & Resources - Aligns with "Description" */}
                <div className="col-span-12 sm:col-span-4 pr-8">
                  <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4 whitespace-nowrap">
                    {t('footer.personalResources')}
                  </h3>
                  <ul className="space-y-3">
                    {resourceLinks.map(link => {
                      // Don't render manifesto link when showManifesto is false
                      if (link.id === 'manifesto' && !showManifesto) {
                        return null;
                      }
                      
                      return (
                        <li key={link.id}>
                          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                            <a
                              href={link.href}
                              {...(!isInternalLink(link.href) && {
                                target: "_blank",
                                rel: "noopener noreferrer"
                              })}
                              className="font-ibm-plex text-primary hover:text-[#D8F600] transition-colors whitespace-nowrap"
                              onMouseEnter={(e) => handleMouseEnter(e, link.id)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {link.id === 'music' ? (
                                <span className="inline-flex items-center">
                                  {t(`resources.${link.id}`)}
                                  <NowPlayingIndicator isPlaying={nowPlaying?.isPlaying} />
                                </span>
                              ) : (
                                t(`resources.${link.id}`)
                              )}
                            </a>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Column 4: Site Navigation */}
                <div className="col-span-12 sm:col-span-4 pr-8">
                  <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4 whitespace-nowrap">
                    {t('footer.siteNavigation')}
                  </h3>
                  <ul className="space-y-3">
                    {navigationLinks.map(link => (
                      <li key={link.id}>
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                        <a
                          href={link.href}
                          className="font-ibm-plex text-primary hover:text-[#D8F600] transition-colors whitespace-nowrap"
                          onClick={(e) => handleNavClick(e, link.href)}
                          onMouseEnter={(e) => handleMouseEnter(e, link.id)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                          >
                            {/* Reuses keys from the header localization */}
                            {t(`header.${link.id}`)}
                          </a>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* --- Divider --- */}
          <hr className="border-secondary mt-16 mb-10 md:mt-16 md:mb-4" />

          {/* --- Bottom Row: Lang Switcher, Version, Disclaimers --- */}
          <div className="grid grid-cols-12 gap-y-8 md:gap-x-2 text-sm text-secondary">
            {/* Aligns with Logo Column */}
            <div className="col-span-12 md:col-span-6">
              <LanguageSwitcher />
            </div>

            {/* Aligns with Link Columns */}
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-12 gap-y-8 sm:gap-x-4">
                {/* Aligns with Socials */}
                <div className="col-span-12 sm:col-span-4 pr-8">
                  <p className="whitespace-nowrap overflow-hidden text-ellipsis">v2.4.1 October 2025</p>
                </div>
                {/* Aligns with Resources */}
                <div className="col-span-12 sm:col-span-4 pr-8">
                  <p className="whitespace-nowrap overflow-hidden text-ellipsis">{t('footer.portraitDisclaimer')}</p>
                </div>
                {/* Aligns with Site Map */}
                <div className="col-span-12 sm:col-span-4 pr-8">
                  <p className="whitespace-nowrap overflow-hidden text-ellipsis">{t('footer.copyright')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Custom Tooltip Component --- */}
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
            <NowPlayingCard
              key={nowPlaying?.songUrl ?? nowPlaying?.title ?? 'np'}
              data={nowPlaying}
            />
          ) : (
            <div className="bg-[#D8F600] text-black text-sm px-3 py-1.5 rounded-md shadow-lg font-space-grotesk">
              {t(`tooltips.${activeTooltipId}`)}
            </div>
          )}
        </motion.div>
      )}
    </>
  )
}