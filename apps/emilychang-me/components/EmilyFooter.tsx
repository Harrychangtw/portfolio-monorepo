"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { scrollToSection } from "@portfolio/lib/lib/scrolling"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

const navigationLinks = [
  { id: 'about', name: 'About', href: '/#about' },
  { id: 'projects', name: 'Projects', href: '/projects' },
  { id: 'canvas', name: 'Canvas', href: '/canvas' },
  { id: 'sketches', name: 'Sketches', href: '/#sketches' },
]

const socialAndResourceLinks = [
    { id: 'gmail', name: 'Email', href: 'mailto:koding.chang@gmail.com' },
    { id: 'art_instagram', name: 'Art Instagram', href: 'https://www.instagram.com/weirdoo_club?igsh=ZjE2ZnR1anFneWp6&utm_source=qr' },
    { id: 'personal_instagram', name: 'Personal Instagram', href: 'https://www.instagram.com/dumbass_emi_?igsh=MXR4dTB0emk2c2h0dQ%3D%3D&utm_source=qr' },
    { id: 'spotify', name: 'Spotify', href: 'https://open.spotify.com/user/snth1yq0x1gilq0h52rsudjed?si=37WuZ9pOQ_2EwPdnVEYwww' },
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

            {/* Column 1: Name & Description */}
            <div className="col-span-12 md:col-span-6 md:pr-24 md:mt-2 max-w-xl">
              <div className="block mb-6">
                <h2 className="font-heading text-3xl text-primary">
                  Emily Chang
                </h2>
              </div>
              <div className="font-body text-base text-primary space-y-3">
                <p>Designer & Artist exploring the intersection of creativity and expression.</p>
                <p>
                  Based in Taiwan, creating meaningful work through design, art, and illustration.
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
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                          <a
                            href={link.href}
                            {...(!isInternalLink(link.href) && {
                              target: "_blank",
                              rel: "noopener noreferrer"
                            })}
                            className="font-body text-primary hover:text-[hsl(var(--accent))] transition-colors whitespace-nowrap"
                            onMouseEnter={(e) => handleMouseEnter(e, link.id)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {link.name}
                          </a>
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
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                          <a
                            href={link.href}
                            className="font-body text-primary hover:text-[hsl(var(--accent))] transition-colors whitespace-nowrap"
                            onClick={(e) => handleNavClick(e, link.href)}
                            onMouseEnter={(e) => handleMouseEnter(e, link.id)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t(`sections.${link.id}`)}
                          </a>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-[hsl(var(--background))] mt-16 mb-10 md:mt-16 md:mb-4" />

          {/* Bottom Row: Copyright & Developer Credit */}
          <div className="flex flex-col md:flex-row md:justify-between items-center text-sm text-secondary gap-2 md:gap-0">
            <p className="whitespace-nowrap overflow-hidden text-ellipsis md:text-left text-center w-full md:w-auto">
              © {new Date().getFullYear()} Emily Chang. All rights reserved.
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis md:text-right text-center w-full md:w-auto">
              Developed by <a href="https://harrychang.me" target="_blank" rel="noopener noreferrer" className="underline hover:text-[hsl(var(--accent))]">Harry Chang</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Tooltip */}
      {activeTooltipId && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50"
          style={{
            top: tooltipPosition.y - 40,
            left: tooltipPosition.x,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div className="bg-[hsl(var(--accent))] text-white text-sm px-3 py-1.5 rounded-md shadow-lg font-body">
            {activeTooltipId}
          </div>
        </motion.div>
      )}
    </>
  )
}
