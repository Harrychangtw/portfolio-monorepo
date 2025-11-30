"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { scrollToSection } from "@portfolio/lib/lib/scrolling"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { siteConfig } from "@/config/site"
import { ANIMATION, UI } from "@portfolio/config"

const navigationLinks = siteConfig.navigation

const socialAndResourceLinks = [
    { id: 'gmail', name: 'Email', href: `mailto:${siteConfig.author.email}` },
    { id: 'art_instagram', name: siteConfig.social.artInstagram.name, href: siteConfig.social.artInstagram.url },
    { id: 'personal_instagram', name: siteConfig.social.personalInstagram.name, href: siteConfig.social.personalInstagram.url },
    { id: 'music', name: siteConfig.social.spotify.name, href: siteConfig.social.spotify.url },
]




export default function EmilyFooter() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY })
    setActiveTooltipId(id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTooltipId) {
      setTooltipPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseLeave = () => {
    setActiveTooltipId(null)
  }

  const isInternalLink = (href: string) => href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:')

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#') && pathname === '/') {
      const id = href.split('#')[1]
      if (id) {
        scrollToSection(id, e)
      }
    }
  }

  return (
    <>
      <footer className="bg-card text-primary py-12 md:py-16 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-12 gap-y-10 md:gap-x-2">

            {/* Column 1: Name & Credits */}
            <div className="col-span-12 md:col-span-6 md:pr-24 max-w-xl">
              <div className="block mb-20">
                  <Link
                    href="/"
                    className="relative h-12 mb-8 block cursor-pointer group"
                    aria-label="Return to home page"
                  >
                    <Image
                      src={siteConfig.media.footerIcon}
                      alt={`${siteConfig.author.name} Logo`}
                      width={siteConfig.media.footerIconDimensions.width}
                      height={siteConfig.media.footerIconDimensions.height}
                      className="object-contain transition-opacity group-hover:opacity-80"
                      priority
                      style={{ width: 'auto', height: `${siteConfig.media.footerIconDimensions.displayHeight}px` }}
                    />
                    <span className="sr-only">{siteConfig.author.name}</span>
                  </Link>
              </div>
              <div className="text-sm text-secondary space-y-2">
                <p>© {new Date().getFullYear()} {siteConfig.author.name}. All rights reserved.</p>
                <p>
                  Developed by <a href={siteConfig.developer.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-[hsl(var(--accent))]">{siteConfig.developer.name}</a>
                </p>
              </div>
            </div>

            {/* Columns 2 & 3 Wrapper */}
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                
                {/* Column 2: Connect */}
                <div className="col-span-1 md:pr-8">
                  <h3 className="font-heading uppercase tracking-wider italic text-lg text-secondary mb-4 whitespace-nowrap">
                    Connect
                  </h3>
                  <ul className="space-y-3">
                    {socialAndResourceLinks.map(link => (
                      <li key={link.id}>
                        <motion.div whileHover={{ y: UI.motion.hoverLift }} transition={{ duration: ANIMATION.duration.normal }}>
                          <Link
                            href={link.href}
                            {...(!isInternalLink(link.href) && {
                              target: "_blank",
                              rel: "noopener noreferrer"
                            })}
                            className="font-body text-primary hover:text-[hsl(var(--accent))] transition-colors whitespace-nowrap"
                            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => handleMouseEnter(e, link.id)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Site Navigation */}
                <div className="col-span-1 md:pr-8">
                  <h3 className="font-heading uppercase tracking-wider italic text-lg text-secondary mb-4 whitespace-nowrap">
                    {t('footer.siteNavigation')}
                  </h3>
                  <ul className="space-y-3">
                    {navigationLinks.map(link => (
                      <li key={link.id}>
                        <motion.div whileHover={{ y: UI.motion.hoverLift }} transition={{ duration: ANIMATION.duration.normal }}>
                          <Link
                            href={link.href}
                            className="font-body text-primary hover:text-[hsl(var(--accent))] transition-colors whitespace-nowrap"
                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, link.href)}
                            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => handleMouseEnter(e, link.id)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t(`sections.${link.id}`)}
                          </Link>
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

      {/* Custom Tooltip */}
      {activeTooltipId && (
        <motion.div
          initial={{ opacity: ANIMATION.opacity.hidden, y: 10, scale: ANIMATION.scale.subtle }}
          animate={{ opacity: ANIMATION.opacity.visible, y: 0, scale: ANIMATION.scale.normal }}
          exit={{ opacity: ANIMATION.opacity.hidden, y: 10, scale: ANIMATION.scale.subtle }}
          transition={{ duration: ANIMATION.duration.fast, ease: ANIMATION.easing.easeOut }}
          className="fixed z-50"
          style={{
            top: tooltipPosition.y + UI.tooltip.offsetY,
            left: tooltipPosition.x,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div className="bg-[hsl(var(--accent))] text-white text-sm px-3 py-1.5 rounded-md shadow-lg font-body">
            {t(`tooltips.${activeTooltipId}`)}
          </div>
        </motion.div>
      )}
    </>
  )
}
