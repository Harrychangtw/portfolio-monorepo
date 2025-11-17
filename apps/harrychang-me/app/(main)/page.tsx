import type { Metadata } from "next"
import AboutSection from "@portfolio/ui/about-section"
import UpdatesSection from "@portfolio/ui/updates-section"
import ProjectsSection from "@portfolio/ui/projects-section"
import GallerySection from "@portfolio/ui/gallery-section"

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
  return (
    <>
      <AboutSection />
      <UpdatesSection />
      <ProjectsSection />
      <GallerySection />
    </>
  )
}


