"use client"

import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

export default function SketchesPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <h1 className="font-heading italic text-3xl md:text-4xl text-primary mb-4">
          {t('sections.sketches')}
        </h1>
        <p className="font-body text-secondary mb-8">
          Browse through my sketch collection and quick studies.
        </p>
      </div>
      
      <section className="py-12 md:py-16 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <span className="text-secondary text-sm">Sketch {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
