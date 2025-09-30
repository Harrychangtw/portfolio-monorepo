"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import LanguageSwitcher from "@/components/language-switcher"
import StaggeredMenu from "@/components/staggered-menu"
import { useStableHashScroll } from "@/hooks/use-stable-hash-scroll"

// Define smooth scroll duration (adjust as needed, keep consistent with timeout)
const SCROLL_ANIMATION_DURATION = 800; // ms

export default function Header() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<string>("about")
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isHomePage = pathname === "/"
  const isPaperReadingPage = pathname?.startsWith('/paper-reading');
  const isManifestoPage = pathname?.startsWith('/manifesto');
  const isUsesPage = pathname?.startsWith('/uses');
  const isMobile = useIsMobile()
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to manage timeout
  const { t } = useLanguage()
  
  // Use stable hash scroll hook for perfect alignment
  useStableHashScroll("header")

  // Tiny retry to correct alignment for ~1.2s after click
  function ensurePreciseAlign(id: string, duration = 1200) {
      const el = document.getElementById(id)
      if (!el) return

      const getHeaderH = () =>
          (document.querySelector("header") as HTMLElement | null)?.getBoundingClientRect().height || 0

      const start = performance.now()
      let raf = 0

      const step = () => {
          const delta = el.getBoundingClientRect().top - getHeaderH()
          if (Math.abs(delta) > 0.5) {
              window.scrollBy({ top: delta, behavior: "auto" })
          }
          if (performance.now() - start < duration) {
              raf = requestAnimationFrame(step)
          }
      }

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(step)
  }

  // Function to determine if a path corresponds to the current page or section
  const isActive = (sectionId: string) => activeSection === sectionId;

  const scrollToSection = (id: string, event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Clear any existing scroll timeout to prevent premature resetting of isScrolling
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // If we are already on the home page, prevent navigation and scroll
    if (isHomePage) {
      event?.preventDefault(); // Prevent default link behavior only if already home
      const element = document.getElementById(id)
      if (element) {
        // 1. Set scrolling flag immediately
        setIsScrolling(true)
        // 2. Set active section immediately for instant underline feedback
        setActiveSection(id)

        // 3. Start scroll
const headerOffset = document.querySelector('header')?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Kick off loading of the target section immediately
        window.dispatchEvent(new CustomEvent("force-load-section", { detail: id }))

        // Tiny retry to correct any CLS while content starts streaming in
        ensurePreciseAlign(id, 500)

        // 4. Set timeout to reset scrolling flag *after* scroll likely finishes
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
          scrollTimeoutRef.current = null; // Clear the ref
          // Optional: Re-verify position after scroll in case it overshot slightly
          // handleScroll(); // Be cautious if enabling this, could cause loops if not careful
        }, SCROLL_ANIMATION_DURATION + 100) // Add a small buffer
      }
    }
    // If not on the home page, the Link's default href="/#id" will handle navigation.
  }

  // Effect for handling initial load - simplified since useStableHashScroll handles hash navigation
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const id = window.location.hash.substring(1)
      setActiveSection(id);
    } else if (isHomePage && window.scrollY < 50) {
      setActiveSection('about');
    }
    
    // Cleanup timeout on component unmount or if isHomePage changes
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHomePage])

  // Effect for updating active section based on scroll position (only on homepage)
  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      // --- CRITICAL: Check isScrolling flag FIRST ---
      if (isScrolling) {
        // console.log("Skipping scroll update because isScrolling is true"); // Debugging
        return;
      }
      
      // --- CRITICAL: Skip scroll handling if menu is open ---
      if (isMenuOpen) {
        return;
      }
      // --- END CRITICAL CHECK ---

      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const scrollY = window.scrollY;
      
      // Get all sections with their positions
      const sections = [
        { id: 'about', element: document.getElementById('about') },
        { id: 'updates', element: document.getElementById('updates') },
        { id: 'projects', element: document.getElementById('projects') },
        { id: 'gallery', element: document.getElementById('gallery') },
      ];

      let currentSection = 'about'; // Default
      
      // Find the current section based on which section's top is closest to being above the header bottom
      // but still visible (i.e., its top hasn't passed the bottom of the header by too much)
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section.element) continue;
        
        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;
        
        // Check if we're currently viewing this section:
        // - The section top should be at or above the bottom of header (with some tolerance)
        // - OR we're somewhere within the section bounds
        const isInSection = (
          // Case 1: Section top is visible just below header or we've scrolled past it slightly
          (sectionTop <= scrollY + headerHeight + 50) &&
          // Case 2: We haven't scrolled past the section completely
          (sectionBottom > scrollY + headerHeight)
        );
        
        if (isInSection) {
          currentSection = section.id;
          // Don't break here - continue to find the most appropriate section
          // The last matching section will be the active one
        }
      }
      
      // Only update state if the section actually changed
      setActiveSection(prevSection => {
          if (prevSection !== currentSection) {
              // console.log(`Scroll detected change to: ${currentSection}`); // Debugging
              return currentSection;
          }
          return prevSection;
      });
    };

    handleScroll(); // Run once on mount/homepage load
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);

  }, [isHomePage, isScrolling]) // isScrolling dependency IS important here

  // Effect for updating active section based on pathname (for non-homepage routes)
  useEffect(() => {
    if (!isHomePage) {
      // When navigating *away* from home, cancel any pending scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        setIsScrolling(false); // Ensure flag is reset if navigating away mid-scroll
      }
      if (pathname?.startsWith('/projects')) {
        setActiveSection('projects')
      } else if (pathname?.startsWith('/gallery')) {
        setActiveSection('gallery')
      } else {
        setActiveSection('about')
      }
    }
  }, [pathname, isHomePage])

  const showSectionTitle = (isHomePage && activeSection !== "about") ||
                           (!isHomePage && (pathname?.startsWith('/projects') || pathname?.startsWith('/gallery')));
  const titleToShow = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);

  // Reusable Underline Component - APPLY WORKAROUND HERE
  const Underline = () => (
    <motion.span
      layoutId="navUnderline"
      className="absolute left-0 bottom-[-4px] h-[1px] w-full bg-primary"
      // WORKAROUND: Use a spring animation to minimize visual jump effect
      transition={{ type: "spring", stiffness: 500, damping: 40 }} // Stiffer spring, more damping
      initial={false}
    />
  );

  // Helper to generate link props (no changes needed here)
  const getLinkProps = (sectionId: string, pagePath: string) => {
    const active = isActive(sectionId);
    const baseClasses = `relative font-space-grotesk ${active ? "text-primary" : "text-secondary hover:text-[#D8F600]"} transition-colors duration-200 outline-none`;
    const href = pathname?.startsWith(pagePath) && pagePath !== '/' ? pagePath : `/#${sectionId}`;
    const onClick = isHomePage ? (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => scrollToSection(sectionId, e) : undefined;
    const scroll = !pathname?.startsWith(pagePath);
    return { className: baseClasses, href, onClick, scroll };
  };

  // Determine when to show the staggered menu
  const showStaggeredMenu = isMobile && !isPaperReadingPage && !isManifestoPage && !isUsesPage;
  
  // Menu items for the staggered menu
  const menuItems = [
    {
      label: t('header.about'),
      ariaLabel: t('header.about'),
      link: '/#about',
      sectionId: 'about'
    },
    {
      label: t('header.updates'),
      ariaLabel: t('header.updates'), 
      link: '/#updates',
      sectionId: 'updates'
    },
    {
      label: t('header.projects'),
      ariaLabel: t('header.projects'),
      link: '/#projects',
      sectionId: 'projects'
    },
    {
      label: t('header.gallery'),
      ariaLabel: t('header.gallery'),
      link: '/#gallery', 
      sectionId: 'gallery'
    }
  ];

  // Social items for the staggered menu
  const socialItems = [
    {
      label: t('social.gmail'),
      link: 'mailto:haoyuchang@gmail.com'
    },
    {
      label: t('social.github'),
      link: 'https://github.com/Harrychangtw'
    },
    {
      label: t('social.instagram'),
      link: 'https://instagram.com/harrychangtw'
    },
    {
      label: t('social.discord'),
      link: 'https://discord.gg/harrychangtw'
    }
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 border-b border-border py-4 z-50 bg-background"
    >
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link
              href="/"
              className="font-space-grotesk text-xl font-bold transition-colors hover:text-[#D8F600] outline-none"
              onClick={(e) => { if(isHomePage) scrollToSection('about', e); }}
            >
              Harry Chang
            </Link>
          </motion.div>
          <AnimatePresence mode="wait">
            {showSectionTitle && !isPaperReadingPage && !isManifestoPage && !isUsesPage && (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl text-secondary">｜</span>
                <motion.span 
                  className="font-space-grotesk text-xl text-secondary"
                  key={activeSection}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {t(`header.${activeSection}`)}
                </motion.span>
              </motion.div>
            )}
            {isPaperReadingPage && (
               <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl text-secondary">｜</span>
                <motion.span 
                  className="font-space-grotesk text-xl text-secondary"
                  key="paper-reading"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {t('header.paperReading')}
                </motion.span>
              </motion.div>
            )}
            {isManifestoPage && (
               <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl text-secondary">｜</span>
                <motion.span 
                  className="font-space-grotesk text-xl text-secondary"
                  key="manifesto"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {t('header.manifesto')}
                </motion.span>
              </motion.div>
            )}
            {isUsesPage && (
               <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl text-secondary">｜</span>
                <motion.span 
                  className="font-space-grotesk text-xl text-secondary"
                  key="uses"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {t('header.uses')}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          layout
          layoutRoot
          className="flex items-center space-x-4"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >

          {/* Navigation - Only on desktop and when not on special pages */}
          {!isMobile && !isPaperReadingPage && !isManifestoPage && !isUsesPage && (
            <>
              <nav className="flex space-x-8">
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link {...getLinkProps('about', '/')}>
                    {isActive('about') && <Underline />}
                    {t('header.about')}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link {...getLinkProps('updates', '/')}>
                    {isActive('updates') && <Underline />}
                    {t('header.updates')}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link {...getLinkProps('projects', '/projects')}>
                    {isActive('projects') && <Underline />}
                    {t('header.projects')}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link {...getLinkProps('gallery', '/gallery')}>
                    {isActive('gallery') && <Underline />}
                    {t('header.gallery')}
                  </Link>
                </motion.div>
              </nav>
            </>
          )}
        </motion.div>
      </div>
      
      {/* Staggered Menu - Only show when original nav is hidden */}
      {showStaggeredMenu && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="container relative h-[64px] pointer-events-none">
            <div className="absolute top-4 right-4 pointer-events-auto">
              <StaggeredMenu
                items={menuItems}
                socialItems={socialItems}
                accentColor="#D8F600"
                menuButtonColor="#ffffff"
                openMenuButtonColor="#ffffff"
                displaySocials={true}
                displayItemNumbering={false}
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
                onSectionClick={(sectionId, event) => {
                  if (isHomePage) {
                    scrollToSection(sectionId, event);
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