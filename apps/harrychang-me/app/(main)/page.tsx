import type { Metadata } from "next"
import AboutSection from "@/components/main/about-section"
import UpdatesSection from "@/components/main/updates-section"
import ProjectsSection from "@portfolio/ui/projects-section"
import GallerySection from "@portfolio/ui/gallery-section"
import { getAllGalleryMetadata } from "@portfolio/lib/lib/markdown"

export const metadata: Metadata = {
  title: "Harry Chang 張祺煒 | Portfolio",
  description: "Harry Chang (張祺煒) portfolio showcasing design and development work",
  keywords: ["Harry Chang", "張祺煒", "portfolio", "design", "development", "photography", "Chingshin Academy"],
  alternates: {
    canonical: 'https://www.harrychang.me/',
  },
  openGraph: {
    url: 'https://www.harrychang.me/',
  },
}

export default function Home() {
  // Fetch gallery items at build/request time - dimensions available immediately
  const galleryItems = getAllGalleryMetadata('en')

  return (
    <>
      <AboutSection />
      <UpdatesSection />
      <ProjectsSection />
      <GallerySection initialItems={galleryItems} />
    </>
  )
}


