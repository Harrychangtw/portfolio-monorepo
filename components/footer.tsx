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
import { scrollToSection } from "@/lib/scrolling"

const LanguageSwitcher = dynamic(
  () => import("@/components/language-switcher"),
  { ssr: false }
)

// --- Link Data ---
const navigationLinks = [
  { id: 'about', name: 'About', href: '/#about' },
  { id: 'updates', name: 'Updates', href: '/#updates' },
  { id: 'projects', name: 'Projects', href: '/#projects' },
  { id: 'gallery', name: 'Gallery', href: '/#gallery' },
];

const socialLinks = [
  { id: 'gmail', name: 'Email', href: '/email' },
  { id: 'discord', name: 'Discord', href: '/discord' },
  { id: 'github', name: 'GitHub', href: '/github' },
  { id: 'instagram', name: 'Instagram', href: '/instagram' },
  { id: 'music', name: 'Music Playlists', href: '/spotify' },
  { id: 'letterboxd', name: 'Letterboxd', href: '/letterboxd' },
];

const resourceLinks = [
  { id: 'icarus', name: 'Icarus Lab', href: '/icarus' },
  { id: 'resume', name: 'Resume', href: '/cv' },
  { id: 'manifesto', name: 'Manifesto', href: '/manifesto' },
  { id: 'calendar', name: 'Schedule a Meeting', href: '/cal' },
  { id: 'uses', name: 'Uses', href: '/uses' },
  { id: 'reading', name: 'Paper Reading List', href: '/paper-reading' },
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
  const [isLab, setIsLab] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null)
  
  const hoveringMusic = activeTooltipId === 'music';
  const { data: nowPlaying } = useNowPlaying(hoveringMusic ? 5000 : 60000, {
    fresh: hoveringMusic,
  });
  
  const isMusicTooltip = hoveringMusic && nowPlaying?.isPlaying;

  useEffect(() => {
    setIsClient(true);
    
    // Detect if we're on lab subdomain
    const hostname = window.location.hostname;
    setIsLab(hostname.startsWith('lab.'));
    
    const checkWidth = () => {
      setShowManifesto(window.innerWidth >= 800);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
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
  
  const filteredResourceLinks = resourceLinks.filter(link => link.id !== 'manifesto' || showManifesto);

  // Helper function to determine if a link is internal
  const isInternalLink = (href: string) => {
    return href.startsWith('/');
  };

  // Helper to get the correct href based on lab vs main domain
  const getHref = (href: string, id: string) => {
    if (!isClient) {
      return href; // Return original href during SSR
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    const isIcarusLink = id === 'icarus';

    if (isIcarusLink) {
      if (hostname.includes('localhost')) {
        // Handle localhost, redirect to lab.localhost:3000
        return `${protocol}//lab.localhost${port}`;
      }
      // Handle production domain - properly handle www prefix
      let baseDomain = hostname.replace(/^lab\./, ''); // Remove lab. if present
      baseDomain = baseDomain.replace(/^www\./, '');   // Remove www. if present
      return `${protocol}//lab.${baseDomain}`;
    }

    // If we're on the lab subdomain, and it's an internal link to the main site
    if (isLab && isInternalLink(href)) {
      let mainDomain = hostname.replace(/^lab\./, ''); // Remove lab. prefix
      // Add www. back if needed (for production)
      if (!mainDomain.includes('localhost') && !mainDomain.startsWith('www.')) {
        mainDomain = `www.${mainDomain}`;
      }
      return `${protocol}//${mainDomain}${port}${href}`;
    }

    return href;
  };

  // NEW: Click handler for navigation links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If on lab, let browser handle the cross-domain navigation
    if (isLab) {
      return;
    }
    
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
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

      `}</style>
      <footer className="bg-[#1a1a1a] text-primary py-12 md:py-16 border-t border-border">
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
              <div className="grid grid-cols-2 md:grid-cols-12 gap-x-4 gap-y-10">
                
                {/* Column 2: Social & Contact - Aligns with "Roles" */}
                <div className="col-span-1 md:col-span-4 md:pr-8">
                  <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4 whitespace-nowrap">
                    {t('footer.socialContact')}
                  </h3>
                  <ul className="space-y-3">
                    {socialLinks.map(link => (
                      <li key={link.id}>
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                          <a
                            href={getHref(link.href, link.id)}
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
                                {t(`social.${link.id}`)}
                                <NowPlayingIndicator isPlaying={nowPlaying?.isPlaying} />
                              </span>
                            ) : (
                              t(`social.${link.id}`)
                            )}
                          </a>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Personal & Resources - Aligns with "Description" */}
                <div className="col-span-1 md:col-span-4 md:pr-8">
                  <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4 whitespace-nowrap">
                    {t('footer.personalResources')}
                  </h3>
                  <ul className="space-y-3">
                    {filteredResourceLinks.map(link => (
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
                                : 'hover:text-[#D8F600]'
                            }`}
                            onMouseEnter={(e) => handleMouseEnter(e, link.id)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t(`resources.${link.id}`)}
                          </a>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 4: Site Navigation */}
                <div className="col-span-1 md:col-span-4 md:pr-8 hidden md:block">
                  <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4 whitespace-nowrap">
                    {t('footer.siteNavigation')}
                  </h3>
                  <ul className="space-y-3">
                    {navigationLinks.map(link => (
                      <li key={link.id}>
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                        <a
                          href={getHref(link.href, link.id)}
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

          {/* --- Bottom Row: Lang Switcher & Copyright --- */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-4 text-sm text-secondary">
            <LanguageSwitcher />
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              Chi-Wei Chang 張祺煒 © CC BY-NC 4.0
            </p>
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
