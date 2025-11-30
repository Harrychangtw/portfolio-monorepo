"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import EmilyStaggeredMenu from '@/components/emily-staggered-menu'
import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll"
import { scrollToSection as utilScrollToSection } from "@portfolio/lib/lib/scrolling"

const SCROLL_ANIMATION_DURATION = 400

// Reusable Underline Component
const Underline = () => (
  <motion.span
    layoutId="navUnderline"
    className="absolute left-0 bottom-[-4px] h-[1px] w-full bg-primary"
    transition={{ type: "spring", stiffness: 500, damping: 40 }}
    initial={false}
  />
)

export default function EmilyHeader() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<string>("about")
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hideForFooter, setHideForFooter] = useState(false)
  const isHomePage = pathname === "/"
  const isMobile = useIsMobile()
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useLanguage()  
  useStableHashScroll("header")

  useEffect(() => {
    const update = () => {
      const h = document.querySelector('header')?.getBoundingClientRect().height || 0
      document.documentElement.style.setProperty('--header-offset', `${h}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const isActive = (sectionId: string) => activeSection === sectionId

  const scrollToSection = (id: string, event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    if (isHomePage) {
      event?.preventDefault()
      const element = document.getElementById(id)
      if (element) {
        setIsScrolling(true)
        setActiveSection(id)
        utilScrollToSection(id)
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
          scrollTimeoutRef.current = null
        }, SCROLL_ANIMATION_DURATION + 100)
      }
    }
  }

  useEffect(() => {
    if (!isHomePage) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      return
    }

    // Use requestAnimationFrame to defer state updates
    const updateSection = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1)
        setActiveSection(id)
      } else if (window.scrollY < 50) {
        setActiveSection('about')
      }
    }
    
    requestAnimationFrame(updateSection)
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isHomePage])

  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      if (isScrolling || isMenuOpen) return
      
      const headerHeight = document.querySelector('header')?.offsetHeight || 0
      const scrollY = window.scrollY
      
      const sections = [
        { id: 'about', element: document.getElementById('about') },
        { id: 'projects', element: document.getElementById('projects') },
        { id: 'canvas', element: document.getElementById('canvas') },
        { id: 'sketches', element: document.getElementById('sketches') },
      ]

      let currentSection = 'about'
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        if (!section.element) continue
        
        const sectionTop = section.element.offsetTop
        const sectionBottom = sectionTop + section.element.offsetHeight
        
        const isInSection = (
          (sectionTop <= scrollY + headerHeight + 50) &&
          (sectionBottom > scrollY + headerHeight)
        )
        
        if (isInSection) {
          currentSection = section.id
        }
      }
      
      setActiveSection(prevSection => {
        if (prevSection !== currentSection) {
          return currentSection
        }
        return prevSection
      })
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)

  }, [isHomePage, isScrolling, isMenuOpen])

  const showSectionTitle = isHomePage && activeSection !== "about"
  const titleToShow = activeSection.charAt(0).toUpperCase() + activeSection.slice(1)

  const getLinkProps = (sectionId: string) => {
    const active = isActive(sectionId)
    const baseClasses = `relative font-body text-base ${active ? "text-primary" : "text-secondary hover:text-[hsl(var(--accent))]"} transition-colors duration-200 outline-none`
    const href = `/#${sectionId}`
    const onClick = isHomePage ? (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => scrollToSection(sectionId, e) : undefined
    return { className: baseClasses, href, onClick, scroll: false }
  }

  const menuItems = [
    { label: 'About', ariaLabel: 'About', link: '/#about', sectionId: 'about' },
    { label: 'Projects', ariaLabel: 'Projects', link: '/#projects', sectionId: 'projects' },
    { label: 'Canvas', ariaLabel: 'Canvas', link: '/#canvas', sectionId: 'canvas' },
    { label: 'Sketches', ariaLabel: 'Sketches', link: '/#sketches', sectionId: 'sketches' },
  ]

  const socialItems = [
    { label: 'Email', link: '/email' },
    { label: 'Instagram', link: '/ig_main' },
    { label: 'beli', link: '/beli' },
    { label: 'Spotify', link: '/spotify' },
  ]

  useEffect(() => {
    const onScroll = () => {
      if (isMobile || isMenuOpen) {
        setHideForFooter(false)
        return
      }
      const doc = document.documentElement
      const atBottom = doc.scrollHeight - (window.scrollY + window.innerHeight) <= 1
      setHideForFooter(atBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [isMobile, isMenuOpen])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 border-b border-border py-4 z-[60] bg-background transition-transform duration-300 ease-out will-change-transform ${hideForFooter ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link
              href="/"
              className="font-heading italic text-xl font-semibold transition-colors hover:text-[hsl(var(--accent))] outline-none"
              onClick={(e) => { if(isHomePage) scrollToSection('about', e) }}
            >
              Emily Chang
            </Link>
          </motion.div>
          <AnimatePresence mode="wait">
            {showSectionTitle && (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-2 text-xl">｜</span>
                <motion.span 
                  className="font-heading italic text-xl text-secondary"
                  key={activeSection}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {titleToShow}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          layout
          layoutRoot
          className="flex items-center space-x-6"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {!isMobile && (
            <nav className="flex space-x-6">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link {...getLinkProps('about')}>
                  {isActive('about') && <Underline />}
                  {t('header.about')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link {...getLinkProps('projects')}>
                  {isActive('projects') && <Underline />}
                  {t('header.projects')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link {...getLinkProps('canvas')}>
                  {isActive('canvas') && <Underline />}
                  {t('header.canvas')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link {...getLinkProps('sketches')}>
                  {isActive('sketches') && <Underline />}
                  {t('header.sketches')}
                </Link>
              </motion.div>
            </nav>
          )}
        </motion.div>
      </div>
      
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
          <div className="container relative h-[64px] pointer-events-none">
            <div className="absolute top-4 right-4 pointer-events-auto">
              <EmilyStaggeredMenu
                items={menuItems}
                socialItems={socialItems}
                colors={['hsl(var(--accent))', 'hsl(var(--background))']}
                accentColor="hsl(var(--accent))"
                menuButtonColor="#000000"
                openMenuButtonColor="#000000"
                displaySocials={true}
                displayItemNumbering={false}
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
                onSectionClick={(sectionId, event) => {
                  if (isHomePage) {
                    scrollToSection(sectionId, event)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
