import type { Metadata } from "next"
import AboutSection from "@portfolio/ui/about-section"
import ProjectsSection from "@portfolio/ui/projects-section"
import GallerySection from "@portfolio/ui/gallery-section"

export const metadata: Metadata = {
  title: "Emily Chang | Portfolio",
  description: "Emily Chang portfolio showcasing design, creations, and artistic work",
  keywords: ["Emily Chang", "portfolio", "design", "art", "illustration", "creative"],
  alternates: {
    canonical: 'https://www.emilychang.me/',
  },
  openGraph: {
    url: 'https://www.emilychang.me/',
  },
}

// Placeholder Sketches Section component
function SketchesSection() {
  return (
    <section id="sketches" className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <h2 className="font-playfair-display italic text-2xl md:text-3xl text-primary mb-8">
          Sketches
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <span className="text-secondary text-sm">Sketch {i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <AboutSection />
      <div id="design">
        <ProjectsSection />
      </div>
      <div id="creation">
        <ProjectsSection />
      </div>
      <div id="art">
        <GallerySection />
      </div>
      <SketchesSection />
    </>
  )
}
