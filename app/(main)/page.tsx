import type { Metadata } from "next"
import AboutSection from "@/components/about-section"
import UpdatesSection from "@/components/updates-section"
import ProjectsSection from "@/components/projects-section"
import GallerySection from "@/components/gallery-section"

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


