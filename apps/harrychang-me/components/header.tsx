"use client"

import { useEffect, useState, useRef, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { useNavigation } from '@portfolio/lib/contexts/navigation-context'
import StaggeredMenu from "@/components/staggered-menu"
import NavigationLink from "@portfolio/ui/navigation-link"
import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll"
import { scrollToSection as utilScrollToSection, ensurePreciseAlign } from "@portfolio/lib/lib/scrolling"

// Keep duration consistent with lib/scrolling.ts
const SCROLL_ANIMATION_DURATION = 400; // ms

// Configuration for special pages to reduce repetitive boolean checks
const SPECIAL_PAGES = [
  { prefix: '/paper-reading', key: 'paperReading' },
  { prefix: '/manifesto', key: 'manifesto' },
  { prefix: '/uses', key: 'uses' },
  { prefix: '/linktree', key: 'links' },
  { prefix: '/design', key: 'design' },
];

const NAV_ITEMS = [
  { id: 'about', path: '/' },
  { id: 'updates', path: '/' },
  { id: 'projects', path: '/projects' },
  { id: 'gallery', path: '/gallery' },
];

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isNavigating } = useNavigation()
  const [activeSection, setActiveSection] = useState<string>("about")
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLab, setIsLab] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const isHomePage = pathname === "/"
  
  // DRY: Identify if we are on a special page
  const currentSpecialPage = SPECIAL_PAGES.find(page => pathname?.startsWith(page.prefix));
  const isSpecialPage = !!currentSpecialPage;
  
  const isProjectDetailPage = pathname?.match(/^\/projects\/[^/]+$/);
  const isMobile = useIsMobile()
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage()

  // Detect if we're on the lab subdomain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setIsLab(hostname.includes('lab.localhost') || hostname.includes('lab.harrychang.me'))
    }
  }, [])
  
  // Use stable hash scroll hook for perfect alignment
  useStableHashScroll("header")

  // Expose header height as CSS variable
  useEffect(() => {
    const update = () => {
      const h = document.querySelector('header')?.getBoundingClientRect().height || 0;
      document.documentElement.style.setProperty('--header-offset', `${h}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isActive = (sectionId: string) => activeSection === sectionId;

  const scrollToSection = (id: string, event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (isHomePage) {
      event?.preventDefault();
      const element = document.getElementById(id)
      if (element) {
        setIsScrolling(true)
        setActiveSection(id)
        utilScrollToSection(id);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
          scrollTimeoutRef.current = null;
        }, SCROLL_ANIMATION_DURATION + 100)
      }
    }
  }

  // Effect for handling initial load
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const id = window.location.hash.substring(1)
      setActiveSection(id);
    } else if (isHomePage && window.scrollY < 50) {
      setActiveSection('about');
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHomePage])

  // Effect for updating active section based on scroll position
  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      if (isScrolling || isMenuOpen) return;

      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const scrollY = window.scrollY;
      
      const sections = NAV_ITEMS.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }));

      let currentSection = 'about';
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section.element) continue;
        
        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;
        
        const isInSection = (
          (sectionTop <= scrollY + headerHeight + 50) &&
          (sectionBottom > scrollY + headerHeight)
        );
        
        if (isInSection) {
          currentSection = section.id;
        }
      }
      
      setActiveSection(prevSection => {
          if (prevSection !== currentSection) {
              return currentSection;
          }
          return prevSection;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);

  }, [isHomePage, isScrolling, isMenuOpen])

  // Effect for updating active section based on pathname
  useEffect(() => {
    if (!isHomePage) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        setIsScrolling(false);
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

  // DRY: Logic for determining which title to show
  const showStandardSectionTitle = (isHomePage && activeSection !== "about") ||
                           (!isHomePage && (pathname?.startsWith('/projects') || pathname?.startsWith('/gallery')));
  
  let activeTitleKey: string | null = null;

  if (isLab) {
    activeTitleKey = 'lab';
  } else if (currentSpecialPage) {
    activeTitleKey = currentSpecialPage.key;
  } else if (showStandardSectionTitle) {
    activeTitleKey = activeSection;
  }

  // DRY: Helper logic to determine if nav should be hidden
  const shouldHideNav = isMobile || isSpecialPage || isLab;

  // Reusable Underline Component
  const Underline = () => (
    <motion.span
      layoutId="navUnderline"
      className="absolute left-0 bottom-[-4px] h-[1px] w-full bg-primary"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      initial={false}
    />
  );

  // Helper to generate link props
  const getLinkProps = (sectionId: string, pagePath: string) => {
    const active = isActive(sectionId);
    const baseClasses = `relative font-heading ${active ? "text-primary" : "text-secondary hover:text-[hsl(var(--accent))]"} transition-colors duration-200 outline-none`;
    const href = pathname?.startsWith(pagePath) && pagePath !== '/' ? pagePath : `/#${sectionId}`;
    const onClick = isHomePage ? (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => scrollToSection(sectionId, e) : undefined;
    const scroll = !pathname?.startsWith(pagePath);
    return { className: baseClasses, href, onClick, scroll };
  };

  // Determine when to show the staggered menu
  const showStaggeredMenu = isMobile && !isSpecialPage && !isLab;
  
  // Menu items for the staggered menu
  const menuItems = NAV_ITEMS.map(item => ({
    label: t(`header.${item.id}`),
    ariaLabel: t(`header.${item.id}`),
    link: `/#${item.id}`,
    sectionId: item.id
  }));

  const socialItems = [
    { label: t('social.gmail'), link: '/email' },
    { label: t('social.github'), link: '/github' },
    { label: t('social.instagram'), link: '/instagram' },
    { label: t('social.discord'), link: '/discord' }
  ];

  // Track reading progress
  useEffect(() => {
    if (!isProjectDetailPage || isLab) return;

    let animationFrameId: number;
    let targetProgress = 0;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      targetProgress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
    };

    const animate = () => {
      setReadingProgress((current) => {
        const diff = targetProgress - current;
        const damped = current + diff * 0.15;
        return Math.abs(diff) < 0.1 ? targetProgress : damped;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    handleScroll();
    animationFrameId = requestAnimationFrame(animate);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isProjectDetailPage, isLab]);

  const getHomeUrl = () => {
    if (isLab) {
      const protocol = typeof window !== 'undefined' && window.location.protocol || 'http:'
      const hostnameWithPort = typeof window !== 'undefined' && window.location.host || 'localhost:3000'
      const mainDomain = hostnameWithPort.replace('lab.', '')
      return `${protocol}//${mainDomain}`
    }
    return '/'
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 border-b border-border py-4 z-[60] bg-background"
    >
      {/* Navigation loading indicator */}
      {isNavigating && (
        <motion.div
          className="absolute top-0 left-0 h-[1px] bg-[hsl(var(--accent))]"
          initial={{ x: "-100%", width: "18%" }}
          animate={{ 
            x: ["-100%", "600%"],
            width: ["18%", "28%", "18%"]
          }}
          transition={{
            x: {
              duration: 0.55,
              repeat: Infinity,
              ease: "linear",
            },
            width: {
              duration: 0.55,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
              times: [0, 0.5, 1]
            }
          }}
        />
      )}

      {/* Reading progress indicator */}
      {isProjectDetailPage && !isLab && !isNavigating && (
        <div
          className="absolute top-0 left-0 h-[1px] bg-[hsl(var(--accent))]"
          style={{ width: `${readingProgress}%` }}
        />
      )}

      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            {isLab ? (
              <a
                href={getHomeUrl()}
                className="font-heading text-xl font-bold transition-colors hover:text-[hsl(var(--accent))] outline-none"
              >
                Harry Chang
              </a>
            ) : (
              <NavigationLink
                href="/"
                className="font-heading text-xl font-bold transition-colors hover:text-[hsl(var(--accent))] outline-none"
                onClick={(e) => { if(isHomePage) scrollToSection('about', e); }}
              >
                Harry Chang
              </NavigationLink>
            )}
          </motion.div>
          
          {/* DRY: Consolidated Title Rendering */}
          <AnimatePresence mode="wait">
            {activeTitleKey && (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl text-secondary">｜</span>
                <motion.span 
                  className="font-heading text-xl text-secondary"
                  key={activeTitleKey}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {/* Handle uppercase for standard sections, translation key for others */}
                  {showStandardSectionTitle && !isSpecialPage && !isLab 
                    ? t(`header.${activeTitleKey}`) 
                    : t(`header.${activeTitleKey}`)
                  }
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
          {!shouldHideNav && (
            <nav className="flex space-x-8">
              {NAV_ITEMS.map((item) => (
                <motion.div key={item.id} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <NavigationLink {...getLinkProps(item.id, item.path)}>
                    {isActive(item.id) && <Underline />}
                    {t(`header.${item.id}`)}
                  </NavigationLink>
                </motion.div>
              ))}
            </nav>
          )}
        </motion.div>
      </div>
      
      {/* Staggered Menu - Only show when original nav is hidden */}
      {showStaggeredMenu && (
        <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
          <div className="container relative h-[64px] pointer-events-none">
            <div className="absolute top-4 right-4 pointer-events-auto">
              <StaggeredMenu
                items={menuItems}
                socialItems={socialItems}
                accentColor="hsl(var(--accent))"
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
