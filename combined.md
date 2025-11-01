</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/utils/scrolling.ts>
// Define smooth scroll duration (keep consistent with header)
const SCROLL_ANIMATION_DURATION = 800; // ms

export const scrollToSection = (id: string, event?: React.MouseEvent) => {
  if (event) {
    event.preventDefault();
  }

  const element = document.getElementById(id);
  if (element) {
    const headerOffset = document.querySelector('header')?.offsetHeight || 0;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    // Dispatch event for loading the target section
    window.dispatchEvent(new CustomEvent("force-load-section", { detail: id }));
  }
};

// Helper function for precise alignment (from header)
export const ensurePreciseAlign = (id: string, duration = 1200) => {
  const el = document.getElementById(id);
  if (!el) return;

  const getHeaderH = () =>
    (document.querySelector("header") as HTMLElement | null)?.getBoundingClientRect().height || 0;

  const start = performance.now();
  let raf = 0;

  const step = () => {
    const delta = el.getBoundingClientRect().top - getHeaderH();
    if (Math.abs(delta) > 0.5) {
      window.scrollBy({ top: delta, behavior: "auto" });
    }
    if (performance.now() - start < duration) {
      raf = requestAnimationFrame(step);
    }
  };

  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(step);
};
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/utils/scrolling.ts>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/projects/[slug]/page.tsx>
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getProjectData, getAllProjectSlugs } from "@/lib/markdown"
import ProjectPageClient from "@/components/project-page-client"

const baseUrl = 'https://harrychang.me'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  if (!slug) return { title: "Project Not Found" }
  
  const project = await getProjectData(slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/projects/${baseSlug}`
  
  // Get full URL for the image
  const imageUrl = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${baseUrl}${project.imageUrl.startsWith('/') ? '' : '/'}${project.imageUrl}`

  return {
    title: `${project.title} | Projects`,
    description: project.description,
    keywords: [
      project.title,
      project.category,
      ...(project.subcategory ? [project.subcategory] : []),
      ...(project.technologies || []),
      'Harry Chang',
      '張祺煒',
    ].filter(Boolean),
    authors: [{ name: 'Harry Chang' }],
    creator: 'Harry Chang',
    publisher: 'Harry Chang',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': canonicalUrl,
        'zh-TW': `${canonicalUrl}?lang=zh-TW`,
      },
    },
    openGraph: {
      title: project.title,
      description: project.description,
      url: canonicalUrl,
      siteName: 'Harry Chang Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      locale: isChineseVersion ? 'zh_TW' : 'en_US',
      type: 'article',
      publishedTime: project.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [imageUrl],
      creator: '@harrychangtw',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      // Preload the hero image for better LCP
      'preload-hero-image': project.imageUrl,
    }
  }
}

export async function generateStaticParams() {  
  const paths = getAllProjectSlugs()
  return paths
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  if (!slug) notFound()
  
  const project = await getProjectData(slug)

  if (!project || project.locked) { // Check if project exists and is not locked
    notFound()
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/projects/${baseSlug}`
  
  // Get full URL for the image
  const imageUrl = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${baseUrl}${project.imageUrl.startsWith('/') ? '' : '/'}${project.imageUrl}`

  // Create structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: project.title,
    description: project.description,
    image: imageUrl,
    datePublished: project.date,
    author: {
      '@type': 'Person',
      name: 'Harry Chang',
      alternateName: '張祺煒',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Harry Chang',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: [
      project.category,
      ...(project.subcategory ? [project.subcategory] : []),
      ...(project.technologies || []),
    ].join(', '),
    inLanguage: isChineseVersion ? 'zh-TW' : 'en-US',
    ...(project.role && { contributor: project.role }),
    ...(project.website && { url: project.website }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProjectPageClient initialProject={project} />
    </>
  )
}

<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/projects/[slug]/page.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/layout.tsx>
import './globals.css'
import '@/styles/lcp-optimize.css'
import '@/styles/video-embed.css'
import type React from 'react'
import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientLayout from './ClientLayout'
import Footer from '@/components/footer'
import { Space_Grotesk, Press_Start_2P, IBM_Plex_Sans } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start-2p',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://harrychang.me'),
  title: {
    template: '%s | Harry Chang',
    default: 'Harry Chang 張祺煒 | Portfolio',
  },
  description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
  keywords: ['Harry Chang', '張祺煒', 'portfolio', 'photography', 'development', 'design', 'research', 'AI', 'machine learning'],
  authors: [{ name: 'Harry Chang', url: 'https://harrychang.me' }],
  creator: 'Harry Chang',
  publisher: 'Harry Chang',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh-TW': '/?lang=zh-TW',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    url: 'https://harrychang.me',
    siteName: 'Harry Chang Portfolio',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Harry Chang Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
    creator: '@harrychangtw',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any'
      }
    ],
    apple: {
      url: '/apple-icon.png',
      type: 'image/png'
    },
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000'
      }
    ]
  },
  verification: {
    // Add your verification codes here when you get them (optional)
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Website structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Harry Chang',
    alternateName: '張祺煒',
    url: 'https://harrychang.me',
    sameAs: [
      // Add your social media profiles here
      'https://github.com/Harrychangtw',
      // 'https://twitter.com/harrychangtw',
      // 'https://linkedin.com/in/harrychangtw',
    ],
    jobTitle: 'Developer & Researcher',
    description: 'Portfolio showcasing photography, development, and design work',
  }

  return (
    <html lang="en" className={`dark ${pressStart2P.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`bg-background text-primary antialiased min-h-screen flex flex-col`}>
        <ClientLayout>
          <main id="site-content" className="site-content flex-1 pt-16 relative z-[2] bg-background">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
        </ClientLayout>
      </body>
    </html>
  )
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/layout.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/styles/lcp-optimize.css>
/* Minimal LCP optimization styles - focused on performance */
.lcp-bio {
  /* Optimize text rendering for faster paint */
  text-rendering: optimizeSpeed;
  
  /* Ensure high paint priority */
  content-visibility: visible;
  
  /* Reduce layout calculations */
  contain: paint;
  
  /* Ensure fast font display */
  font-display: block;
}

/* Pre-connect to common font origins to speed up font loading */
:root {
  text-size-adjust: 100%;
}

/* Force the browser to assign high priority to paint */
@supports (content-visibility: auto) {
  .page-transition-enter {
    content-visibility: auto;
    contain-intrinsic-size: 0 1000px;
  }
}

/* Optimize for LCP */
.gallery-image-container {
  content-visibility: auto;
  contain: size layout paint;
}

/* Pre-size image containers to prevent layout shifts */
.gallery-card-container,
.project-card-container {
  min-height: 300px;
  content-visibility: auto;
  contain: size layout paint;
}

/* Optimize paint performance */
.gallery-image,
.project-image {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  content-visibility: visible;
}

/* Progressive loading indicators */
.loading-indicator {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

/* Markdown images optimization */
.gallery-figure {
  contain: paint;
  content-visibility: auto;
}

.gallery-figure .image-container {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform;
}

/* Footer layout stability */
footer.bg-\[\#1a1a1a\] {
  contain: layout paint;
}

/* Reveal footer: dynamic height + overlay content */
:root {
  --footer-h: 0px;
}

.site-content {
  position: relative;
  z-index: 2;
  /* Pull main content over the footer, but preserve scrollable space */
  margin-bottom: calc(var(--footer-h, 0px) * -1);
  padding-bottom: var(--footer-h, 0px);
}

/* Sticky footer that reveals as content slides up */
footer.reveal-footer {
  position: sticky;
  bottom: 0;
  z-index: 1; /* Content has higher z-index to cover it */
  contain: layout paint;
  will-change: transform;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Prevent layout shifts during image load */
.aspect-container {
  position: relative;
  height: 0;
  overflow: hidden;
}

/* Optimize paint performance for animations */
.gallery-transition {
  transform: translate3d(0, 0, 0);
}<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/styles/lcp-optimize.css>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/footer.tsx>
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
                  <p className="whitespace-nowrap overflow-hidden text-ellipsis">v2.3.0 October 2025</p>
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
}<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/footer.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/header.tsx>
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
import { scrollToSection as utilScrollToSection, ensurePreciseAlign } from "@/utils/scrolling"

// Define smooth scroll duration (adjust as needed, keep consistent with timeout)
const SCROLL_ANIMATION_DURATION = 800; // ms

export default function Header() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<string>("about")
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hideForFooter, setHideForFooter] = useState(false)
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

        // 3. Use the utility function for scrolling
        utilScrollToSection(id);

        // Tiny retry to correct any CLS while content starts streaming in
        ensurePreciseAlign(id, 500)

        // 4. Set timeout to reset scrolling flag *after* scroll likely finishes
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
          scrollTimeoutRef.current = null; // Clear the ref
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

  // Detect when user reaches the bottom (footer fully revealed)
  useEffect(() => {
    const onScroll = () => {
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
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 border-b border-border py-4 z-50 bg-background transition-transform duration-300 ease-out will-change-transform ${hideForFooter ? '-translate-y-full' : 'translate-y-0'}`}
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
}<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/header.tsx>

