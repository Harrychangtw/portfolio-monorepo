diff --git a/apps/emilychang-me/app/(main)/page.tsx b/apps/emilychang-me/app/(main)/page.tsx
index 0ecaaaf..faec9ff 100644
--- a/apps/emilychang-me/app/(main)/page.tsx
+++ b/apps/emilychang-me/app/(main)/page.tsx
@@ -1,6 +1,6 @@
 "use client"
 
-import EmilyAboutSection from "@portfolio/ui/emily-about-section"
+import EmilyAboutSection from "@/components/about-section"
 import ProjectsSection from "@portfolio/ui/projects-section"
 import GallerySection from "@portfolio/ui/gallery-section"
 import SketchesSection from "@portfolio/ui/sketches-section"
diff --git a/apps/emilychang-me/components/EmilyHeader.tsx b/apps/emilychang-me/components/EmilyHeader.tsx
index 7db5351..8155aa3 100644
--- a/apps/emilychang-me/components/EmilyHeader.tsx
+++ b/apps/emilychang-me/components/EmilyHeader.tsx
@@ -6,7 +6,7 @@ import { usePathname } from "next/navigation"
 import { motion, AnimatePresence } from "framer-motion"
 import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
 import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"
-import EmilyStaggeredMenu from "./EmilyStaggeredMenu"
+import EmilyStaggeredMenu from "@/components/EmilyStaggeredMenu"
 import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll"
 import { scrollToSection as utilScrollToSection } from "@portfolio/lib/lib/scrolling"
 
diff --git a/packages/ui/emily-about-section.tsx b/apps/emilychang-me/components/about-section.tsx
similarity index 99%
rename from packages/ui/emily-about-section.tsx
rename to apps/emilychang-me/components/about-section.tsx
index f57912c..444a05e 100644
--- a/packages/ui/emily-about-section.tsx
+++ b/apps/emilychang-me/components/about-section.tsx
@@ -1,7 +1,7 @@
 "use client"
 
 import { useState, useEffect } from 'react'
-import Lanyard from './Lanyard'
+import Lanyard from '@portfolio/ui/Lanyard'
 
 // Reusable component for section titles
 const SectionTitle = ({ children }: { children: React.ReactNode }) => (
diff --git a/apps/emilychang-me/tsconfig.json b/apps/emilychang-me/tsconfig.json
index a8090df..c8a532c 100644
--- a/apps/emilychang-me/tsconfig.json
+++ b/apps/emilychang-me/tsconfig.json
@@ -55,7 +55,7 @@
     ".next/dev/types/**/*.ts",
     "**/*.mts",
     "../../packages/ui/meshline.d.ts"
-  ],
+, "../../packages/ui/sketches-card.tsx", "../../packages/ui/sketches-section.tsx", "../../packages/ui/Lanyard.tsx"  ],
   "exclude": [
     "node_modules"
   ]
diff --git a/apps/harrychang-me/app/(main)/design/page.tsx b/apps/harrychang-me/app/(main)/design/page.tsx
index eb51df1..22fdcc0 100644
--- a/apps/harrychang-me/app/(main)/design/page.tsx
+++ b/apps/harrychang-me/app/(main)/design/page.tsx
@@ -1,5 +1,5 @@
 import type { Metadata } from 'next'
-import TypographyPageClient from '@portfolio/ui/typography-page-client'
+import TypographyPageClient from '@/components/main/TypographyPageClient'
 
 export const metadata: Metadata = {
   title: 'Typography',
diff --git a/apps/harrychang-me/app/(main)/layout.tsx b/apps/harrychang-me/app/(main)/layout.tsx
index aa580b8..bc439ce 100644
--- a/apps/harrychang-me/app/(main)/layout.tsx
+++ b/apps/harrychang-me/app/(main)/layout.tsx
@@ -4,7 +4,7 @@ import type React from 'react'
 import type { Metadata } from 'next'
 import { SpeedInsights } from '@vercel/speed-insights/next'
 import ClientLayout from '@/components/main/ClientLayout'
-import Footer from '@portfolio/ui/footer'
+import Footer from '@/components/footer'
 import { siteConfig } from '@/config/site'
 
 export const metadata: Metadata = {
diff --git a/apps/harrychang-me/app/(main)/linktree/page.tsx b/apps/harrychang-me/app/(main)/linktree/page.tsx
index d8dfe13..3af3d2c 100644
--- a/apps/harrychang-me/app/(main)/linktree/page.tsx
+++ b/apps/harrychang-me/app/(main)/linktree/page.tsx
@@ -1,5 +1,5 @@
 import type { Metadata } from "next"
-import LinksPageClient from "@portfolio/ui/links-page-client"
+import LinksPageClient from "@/components/main/links-page-client"
 
 export const metadata: Metadata = {
   title: "Links | Harry Chang 張祺煒",
diff --git a/apps/harrychang-me/app/(main)/manifesto/page.tsx b/apps/harrychang-me/app/(main)/manifesto/page.tsx
index 3ce0391..2579d1d 100644
--- a/apps/harrychang-me/app/(main)/manifesto/page.tsx
+++ b/apps/harrychang-me/app/(main)/manifesto/page.tsx
@@ -1,6 +1,6 @@
 "use client";
 import { useState, useEffect, useRef } from 'react';
-import LetterGlitch from '@portfolio/ui/letter-glitch';
+import LetterGlitch from '@/components/main/letter-glitch';
 import { useLanguage } from '@portfolio/lib/contexts//LanguageContext';
 import LanguageSwitcher from '@portfolio/ui/language-switcher';
 
diff --git a/apps/harrychang-me/app/(main)/page.tsx b/apps/harrychang-me/app/(main)/page.tsx
index e2eb555..632b77a 100644
--- a/apps/harrychang-me/app/(main)/page.tsx
+++ b/apps/harrychang-me/app/(main)/page.tsx
@@ -1,6 +1,6 @@
 import type { Metadata } from "next"
-import AboutSection from "@portfolio/ui/about-section"
-import UpdatesSection from "@portfolio/ui/updates-section"
+import AboutSection from "@/components/main/about-section"
+import UpdatesSection from "@/components/main/updates-section"
 import ProjectsSection from "@portfolio/ui/projects-section"
 import GallerySection from "@portfolio/ui/gallery-section"
 import { getAllGalleryMetadata } from "@portfolio/lib/lib/markdown"
diff --git a/apps/harrychang-me/app/(main)/paper-reading/page.tsx b/apps/harrychang-me/app/(main)/paper-reading/page.tsx
index ad2ee46..dd82317 100644
--- a/apps/harrychang-me/app/(main)/paper-reading/page.tsx
+++ b/apps/harrychang-me/app/(main)/paper-reading/page.tsx
@@ -1,6 +1,6 @@
 import { fetchArxivPapers, getManualPapers, getArxivPaperIds, getPrebuiltPapers } from "@portfolio/lib/lib/arxiv";
 import { Paper } from "@portfolio/lib/types/paper";
-import PaperReadingPageClient from "@portfolio/ui/paper-reading-page-client";
+import PaperReadingPageClient from "@/components/main/paper-reading-page-client";
 
 export default async function PaperReadingPage({
   searchParams,
diff --git a/packages/ui/footer.tsx b/apps/harrychang-me/components/footer.tsx
similarity index 100%
rename from packages/ui/footer.tsx
rename to apps/harrychang-me/components/footer.tsx
diff --git a/packages/ui/header.tsx b/apps/harrychang-me/components/header.tsx
similarity index 99%
rename from packages/ui/header.tsx
rename to apps/harrychang-me/components/header.tsx
index c60deda..0e2f7bd 100644
--- a/packages/ui/header.tsx
+++ b/apps/harrychang-me/components/header.tsx
@@ -8,7 +8,7 @@ import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
 import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"
 import { useNavigation } from "@portfolio/lib/contexts/NavigationContext"
 import LanguageSwitcher from "@portfolio/ui/language-switcher"
-import StaggeredMenu from "@portfolio/ui/staggered-menu"
+import StaggeredMenu from "@/components/staggered-menu"
 import NavigationLink from "@portfolio/ui/navigation-link"
 import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll"
 import { scrollToSection as utilScrollToSection, ensurePreciseAlign } from "@portfolio/lib/lib/scrolling"
diff --git a/apps/harrychang-me/components/lab/ClientLayout.tsx b/apps/harrychang-me/components/lab/ClientLayout.tsx
index e8c4742..944f1be 100644
--- a/apps/harrychang-me/components/lab/ClientLayout.tsx
+++ b/apps/harrychang-me/components/lab/ClientLayout.tsx
@@ -2,8 +2,8 @@
 
 import type React from "react"
 import { LanguageProvider } from "@portfolio/lib/contexts/LanguageContext"
-import Header from "@portfolio/ui/header"
-import Footer from "@portfolio/ui/footer"
+import Header from "@/components/header"
+import Footer from "@/components/footer"
 
 /**
  * Client layout wrapper for the Lab subdomain.
diff --git a/apps/harrychang-me/components/lab/lab-page-client.tsx b/apps/harrychang-me/components/lab/lab-page-client.tsx
index 858ff50..8498be3 100644
--- a/apps/harrychang-me/components/lab/lab-page-client.tsx
+++ b/apps/harrychang-me/components/lab/lab-page-client.tsx
@@ -2,7 +2,7 @@
 import { useState, useEffect } from 'react';
 import { useLanguage } from '@portfolio/lib/contexts/LanguageContext';
 import WaitlistForm from '@/components/lab/waitlist-form';
-import MinimalistBackground from '@portfolio/ui/minimalist-background';
+import MinimalistBackground from '@/components/lab/minimalist-background';
 import { motion, AnimatePresence } from 'framer-motion';
 import AnimatedIcarusIcon from '@/components/lab/animated-icon';
 
diff --git a/packages/ui/minimalist-background.tsx b/apps/harrychang-me/components/lab/minimalist-background.tsx
similarity index 100%
rename from packages/ui/minimalist-background.tsx
rename to apps/harrychang-me/components/lab/minimalist-background.tsx
diff --git a/apps/harrychang-me/components/main/ClientLayout.tsx b/apps/harrychang-me/components/main/ClientLayout.tsx
index 4661ac2..2cc3d83 100644
--- a/apps/harrychang-me/components/main/ClientLayout.tsx
+++ b/apps/harrychang-me/components/main/ClientLayout.tsx
@@ -2,7 +2,7 @@
 
 import type React from "react"
 import { Suspense } from "react"
-import Header from "@portfolio/ui/header"
+import Header from "@/components/header"
 import { Analytics } from "@vercel/analytics/react"
 import ClickSpark from "@portfolio/ui/ui/click-spark"
 import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
diff --git a/packages/ui/typography-page-client.tsx b/apps/harrychang-me/components/main/TypographyPageClient.tsx
similarity index 98%
rename from packages/ui/typography-page-client.tsx
rename to apps/harrychang-me/components/main/TypographyPageClient.tsx
index 23a6843..d0abdf7 100644
--- a/packages/ui/typography-page-client.tsx
+++ b/apps/harrychang-me/components/main/TypographyPageClient.tsx
@@ -1,7 +1,7 @@
 'use client'
 
 import { useState, useEffect, useRef } from 'react'
-import { TypographySpecimen } from '@portfolio/ui/typography-specimen'
+import { TypographySpecimen } from './TypographySpecimen'
 import { getAllFontFamilies } from '@portfolio/lib/lib/typography'
 import { useLanguage } from '@portfolio/lib/contexts/LanguageContext'
 import { GalleryImageContainer } from '@portfolio/ui/gallery-image-container'
diff --git a/packages/ui/typography-specimen.tsx b/apps/harrychang-me/components/main/TypographySpecimen.tsx
similarity index 100%
rename from packages/ui/typography-specimen.tsx
rename to apps/harrychang-me/components/main/TypographySpecimen.tsx
diff --git a/packages/ui/about-section.tsx b/apps/harrychang-me/components/main/about-section.tsx
similarity index 100%
rename from packages/ui/about-section.tsx
rename to apps/harrychang-me/components/main/about-section.tsx
diff --git a/packages/ui/animated-paper-list.tsx b/apps/harrychang-me/components/main/animated-paper-list.tsx
similarity index 100%
rename from packages/ui/animated-paper-list.tsx
rename to apps/harrychang-me/components/main/animated-paper-list.tsx
diff --git a/packages/ui/letter-glitch.tsx b/apps/harrychang-me/components/main/letter-glitch.tsx
similarity index 100%
rename from packages/ui/letter-glitch.tsx
rename to apps/harrychang-me/components/main/letter-glitch.tsx
diff --git a/packages/ui/links-page-client.tsx b/apps/harrychang-me/components/main/links-page-client.tsx
similarity index 100%
rename from packages/ui/links-page-client.tsx
rename to apps/harrychang-me/components/main/links-page-client.tsx
diff --git a/packages/ui/paper-card.tsx b/apps/harrychang-me/components/main/paper-card.tsx
similarity index 100%
rename from packages/ui/paper-card.tsx
rename to apps/harrychang-me/components/main/paper-card.tsx
diff --git a/packages/ui/paper-reading-page-client.tsx b/apps/harrychang-me/components/main/paper-reading-page-client.tsx
similarity index 93%
rename from packages/ui/paper-reading-page-client.tsx
rename to apps/harrychang-me/components/main/paper-reading-page-client.tsx
index 5e3f048..ae3d30a 100644
--- a/packages/ui/paper-reading-page-client.tsx
+++ b/apps/harrychang-me/components/main/paper-reading-page-client.tsx
@@ -1,7 +1,7 @@
 "use client";
 
 import { useLanguage } from "@portfolio/lib/contexts/LanguageContext";
-import AnimatedPaperList from "@portfolio/ui/animated-paper-list";
+import AnimatedPaperList from "@/components/main/animated-paper-list";
 import PaginationControls from "@portfolio/ui/pagination-controls";
 import { Paper } from "@portfolio/lib/types/paper";
 import { motion } from "framer-motion";
diff --git a/packages/ui/updates-section.tsx b/apps/harrychang-me/components/main/updates-section.tsx
similarity index 100%
rename from packages/ui/updates-section.tsx
rename to apps/harrychang-me/components/main/updates-section.tsx
diff --git a/packages/ui/staggered-menu.tsx b/apps/harrychang-me/components/staggered-menu.tsx
similarity index 100%
rename from packages/ui/staggered-menu.tsx
rename to apps/harrychang-me/components/staggered-menu.tsx
diff --git a/apps/harrychang-me/tsconfig.json b/apps/harrychang-me/tsconfig.json
index 14cfc13..d03bed4 100644
--- a/apps/harrychang-me/tsconfig.json
+++ b/apps/harrychang-me/tsconfig.json
@@ -29,6 +29,6 @@
       "@portfolio/config/*": ["../../packages/config/*"]
     }
   },
-  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
+  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "components/main/about-section.tsx", "components/header.tsx", "components/main/letter-glitch.tsx"],
   "exclude": ["node_modules"]
 }
diff --git a/packages/ui/Lanyard.tsx b/packages/ui/Lanyard.tsx
index 736682e..a1659fe 100644
--- a/packages/ui/Lanyard.tsx
+++ b/packages/ui/Lanyard.tsx
@@ -127,9 +127,10 @@ function Band({ maxSpeed = 50, minSpeed = 10 }: BandProps) {
   
   useEffect(() => {
     if (cardTexture) {
-      cardTexture.flipY = false;
-      cardTexture.wrapS = THREE.RepeatWrapping;
-      cardTexture.repeat.x = 1;
+      const texture = cardTexture.clone(); 
+    texture.flipY = false;
+    texture.wrapS = THREE.RepeatWrapping;
+    texture.repeat.x = 1;
       
       // OPTIMIZATION: Limit anisotropy. 16 is overkill for mobile bandwidth.
       // 4 provides good oblique viewing angles without the heavy cost.
diff --git a/packages/ui/index.tsx b/packages/ui/index.tsx
index b4aa40c..cc8abd8 100644
--- a/packages/ui/index.tsx
+++ b/packages/ui/index.tsx
@@ -50,11 +50,11 @@ export * from './ui/tooltip';
 export * from './ui/use-toast';
 
 // Custom components
-export * from './about-section';
-export * from './animated-paper-list';
+export * from '../../apps/harrychang-me/components/main/about-section';
+export * from '../../apps/harrychang-me/components/main/animated-paper-list';
 export * from './curved-loop';
 export * from './decrypted-text';
-export * from './footer';
+export * from '../../apps/harrychang-me/components/footer';
 export * from './gallery-card';
 export * from './gallery-image-container';
 export * from './gallery-item-page-client';
@@ -62,30 +62,30 @@ export * from './gallery-loading-skeleton';
 export * from './gallery-page-client';
 export * from './gallery-section';
 export * from './GalleryImage';
-export * from './header';
+export * from '../../apps/harrychang-me/components/header';
 export * from './language-switcher';
 export { default as Lanyard } from './Lanyard';
-export * from './letter-glitch';
-export * from './links-page-client';
-export * from './minimalist-background';
+export * from '../../apps/harrychang-me/components/main/letter-glitch';
+export * from '../../apps/harrychang-me/components/main/links-page-client';
+export * from '../../apps/harrychang-me/components/lab/minimalist-background';
 export * from './notification-banner';
 export * from './notification-provider';
 export * from './now-playing-card';
 export * from './now-playing-indicator';
 export * from './pagination-controls';
-export * from './paper-card';
-export * from './paper-reading-page-client';
+export * from '../../apps/harrychang-me/components/main/paper-card';
+export * from '../../apps/harrychang-me/components/main/paper-reading-page-client';
 export * from './project-card';
 export * from './project-page-client';
 export * from './projects-page-client';
 export * from './projects-section';
 export * from './scroll-float';
-export * from './staggered-menu';
+export * from '../../apps/harrychang-me/components/staggered-menu';
 export * from './text-type';
 export * from './theme-provider';
 export * from './transition-provider';
 export * from './typography-page-client';
 export * from './typography-specimen';
-export * from './updates-section';
+export * from '../../apps/harrychang-me/components/main/updates-section';
 export * from './video-embed';
 export * from './video-initializer';
diff --git a/packages/ui/transition-provider.tsx b/packages/ui/transition-provider.tsx
deleted file mode 100644
index 049d535..0000000
--- a/packages/ui/transition-provider.tsx
+++ /dev/null
@@ -1,28 +0,0 @@
-"use client"
-
-import type { ReactNode } from "react"
-import { AnimatePresence, motion } from "framer-motion"
-import { usePathname } from "next/navigation"
-
-interface TransitionProviderProps {
-  children: ReactNode
-}
-
-export default function TransitionProvider({ children }: TransitionProviderProps) {
-  const pathname = usePathname()
-
-  return (
-    <AnimatePresence mode="wait">
-      <motion.div
-        key={pathname}
-        initial={{ opacity: 0, y: 10 }}
-        animate={{ opacity: 1, y: 0 }}
-        exit={{ opacity: 0, y: -10 }}
-        transition={{ duration: 0.3 }}
-      >
-        {children}
-      </motion.div>
-    </AnimatePresence>
-  )
-}
-
diff --git a/packages/ui/tsconfig.json b/packages/ui/tsconfig.json
index d640914..c444d8c 100644
--- a/packages/ui/tsconfig.json
+++ b/packages/ui/tsconfig.json
@@ -5,6 +5,6 @@
     "baseUrl": ".",
     "outDir": "dist"
   },
-  "include": ["./**/*.ts", "./**/*.tsx", "meshline.d.ts"],
+  "include": ["./**/*.ts", "./**/*.tsx", "meshline.d.ts", "../../apps/harrychang-me/components/lab/minimalist-background.tsx", "../../apps/harrychang-me/components/staggered-menu.tsx", "../../apps/harrychang-me/components/main/paper-reading-page-client.tsx", "../../apps/harrychang-me/components/main/paper-card.tsx", "../../apps/harrychang-me/components/main/about-section.tsx", "../../apps/harrychang-me/components/header.tsx", "../../apps/harrychang-me/components/main/letter-glitch.tsx", "../../apps/harrychang-me/components/main/updates-section.tsx", "../../apps/harrychang-me/components/footer.tsx", "../../apps/harrychang-me/components/main/animated-paper-list.tsx", "../../apps/harrychang-me/components/main/links-page-client.tsx", "../../apps/emilychang-me/components/about-section.tsx", "Lanyard.tsx", "sketches-section.tsx", "sketches-card.tsx"],
   "exclude": ["node_modules", "dist"]
 }
