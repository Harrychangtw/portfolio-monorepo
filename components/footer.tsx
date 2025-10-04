"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useIsMobile } from "@/hooks/use-mobile" 
import { useLanguage } from "@/contexts/LanguageContext"

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
  { id: 'gmail', name: 'Email', href: 'mailto:chiwei@harrychang.me', tooltip: 'Always happy for a chat!' },
  { id: 'discord', name: 'Discord', href: 'https://discord.com/users/836567989209661481', tooltip: 'Ping me, maybe I\'ll ping back' },
  { id: 'github', name: 'GitHub', href: 'https://github.com/Harrychangtw', tooltip: 'Check out my GitHub—where repos go to hide' },
  { id: 'instagram', name: 'Instagram', href: 'https://www.instagram.com/pomelo_chang_08/', tooltip: 'Please stalk responsibly' },
  { id: 'letterboxd', name: 'Letterboxd', href: 'https://boxd.it/fSKuF', tooltip: 'Judge my movie tastes harshly.' }, // Placeholder href
];

const resourceLinks = [
  { id: 'resume', name: 'Resume', href: 'https://drive.google.com/file/d/1xINWH85b8W8XIEB90Mw3NlAdKl0-9j6i/view?usp=drive_link', tooltip: 'Proof I know how to adult' },
  { id: 'manifesto', name: 'Manifesto', href: '/manifesto', tooltip: 'A bridge back to naiveté' },
  // { id: 'wallpapers', name: 'Wallpapers', href: 'https://photos.google.com/u/1/share/AF1QipN_xATdICaaIO4RzR5CzdIj6AFeoueQmu5100b-a9_QIAzGLhz4HD95OurMi8pqBQ?key=MnV1OGlrQUdRTUg3Y0FHSkdnYVZrOXNMOU1PWFpn', tooltip: 'Spent way too much time on these...' },
  { id: 'uses', name: 'Uses', href: '/uses', tooltip: 'My tools & setup' },
  { id: 'music', name: 'Music Playlists', href: 'https://open.spotify.com/user/1b7kc6j0zerk49mrv80pwdd96?si=7d5a6e1a4fa34de3', tooltip: 'Make me go :D' },
  { id: 'reading', name: 'Paper Reading List', href: '/paper-reading', tooltip: 'Caffeine-fueled knowledge' },
];

const allLinks = [...socialLinks, ...resourceLinks];


export default function Footer() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showManifesto, setShowManifesto] = useState(true); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
  
  const currentTooltipText = activeTooltipId ? t(`tooltips.${activeTooltipId}`) : '';
  const filteredResourceLinks = resourceLinks.filter(link => link.id !== 'manifesto' || showManifesto);

  // Helper function to determine if a link is internal
  const isInternalLink = (href: string) => {
    return href.startsWith('/');
  };

  return (
    <>
      <footer className="bg-[#1a1a1a] text-primary py-12 md:py-16 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-12 gap-y-10 md:gap-x-2">

            {/* Column 1: Logo & Info - Aligns with the "About" column */}
            <div className="col-span-12 md:col-span-6 md:pr-12 flex flex-col justify-between">
              <div className="space-y-4">
                {/* --- Logo with fixed dimensions to prevent layout shift --- */}
                <div className="flex items-start">
                  <div className="relative h-12 pt-2">
                    <Image
                      src="/chinese_name_icon.png"
                      alt="Harry Chang/Chi-Wei Chang 張祺煒 Logo"
                      width={357} // Calculated from 1784/600 * 120 (h-12 = 48px, but accounting for pt-2)
                      height={120}
                      className="object-contain"
                      priority
                      style={{ width: 'auto', height: '40px' }} // h-12 minus pt-2
                    />
                  </div>
                  <span className="sr-only">Harry Chang/Chi-Wei Chang 張祺煒</span>
                </div>
                <div className="font-ibm-plex text-sm text-secondary space-y-2">
                  <p>{t('footer.copyright')}</p>
                  <p>{t('footer.portraitDisclaimer')}</p>
                </div>
              </div>
              
              {/* Language Switcher - Bottom Left, aligned with column bottom on desktop */}
              <div className="mt-8 md:mt-0 flex justify-start">
                <LanguageSwitcher />
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
                              {t(`resources.${link.id}`)}
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
        </div>
      </footer>

      {/* --- Custom Tooltip Component --- */}
      {currentTooltipText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed bg-[#D8F600] text-black text-sm px-3 py-1.5 rounded-md shadow-lg font-space-grotesk z-50"
          style={{
            top: tooltipPosition.y - 40,
            left: tooltipPosition.x,
            pointerEvents: 'none',
            transform: 'translateX(-50%)'
          }}
        >
          {currentTooltipText}
        </motion.div>
      )}
    </>
  )
}