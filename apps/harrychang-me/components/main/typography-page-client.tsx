'use client'

import { useState, useEffect, useRef } from 'react'
import { TypographySpecimen } from './typography-specimen'
import { getAllFontFamilies } from '@portfolio/lib/lib/typography'
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { GalleryImageContainer } from '@portfolio/ui/gallery-image-container'

//Helper to convert RGB string (returned by getComputedStyle) to Hex
function rgbToHex(rgb: string) {
  // Extract numbers from "rgb(255, 255, 255)"
  const values = rgb.match(/\d+/g)?.map(Number)
  
  if (!values || values.length < 3) return rgb // Return original if parse fails

  return '#' + values.slice(0, 3).map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('').toUpperCase()
}

// Component to resolve and display color
const ColorCard = ({ name, cssValue }: { name: string; cssValue: string }) => {
  const swatchRef = useRef<HTMLDivElement>(null)
  const [resolvedHex, setResolvedHex] = useState<string>('')

  useEffect(() => {
    if (swatchRef.current) {
      // Ask the browser what the computed background color is
      const computedStyle = window.getComputedStyle(swatchRef.current)
      const backgroundColor = computedStyle.backgroundColor
      
      // Convert the computed RGB/RGBA to Hex
      setResolvedHex(rgbToHex(backgroundColor))
    }
  }, [cssValue])

  return (
    <div className="space-y-2">
      <div
        ref={swatchRef}
        className="w-full aspect-square border border-white/10"
        style={{ backgroundColor: cssValue }}
      />
      <div>
        <p className="font-heading text-xs">{name}</p>
        <p className="font-heading text-xs text-white/40 uppercase font-mono">
          {resolvedHex || '...'}
        </p>
      </div>
    </div>
  )
}

export default function TypographyPageClient() {
  const { t } = useLanguage()
  const fonts = getAllFontFamilies()

  // Define the palette
  const colorPalette = [
    { name: 'Background', value: 'hsl(var(--background))' },
    { name: 'Foreground', value: 'hsl(var(--foreground))' },
    { name: 'Primary', value: 'hsl(var(--primary))' },
    { name: 'Secondary', value: 'hsl(var(--secondary))' },
    { name: 'Muted', value: 'hsl(var(--muted))' },
    { name: 'Accent', value: 'hsl(var(--accent))' },
    { name: 'Border', value: 'hsl(var(--border))' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Design Philosophy & Identity */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        <div>
          {/* OG Image Container */}
          <div className="w-full mb-8">
            <GalleryImageContainer
              src="/images/optimized/projects/og/ogimage.webp"
              alt="Harry Chang Portfolio Identity - The Tower of Babel"
              aspectRatio={1.5}
              noInsetPadding={true}
              priority
            />
          </div>
          <h2 className="font-heading text-lg uppercase tracking-wider text-secondary mb-8">
            {t('design.identity')}
          </h2>

          {/* Philosophy Text */}
          <div className="">
            <p className="font-ibm-plex text-lg text-primary mb-6">
              {t('design.identityText1')}
            </p>
            <p className="font-ibm-plex text-lg text-primary mb-6">
              {t('design.identityText2')}
            </p>
          </div>
        </div>
      </section>

      {/* Color System - Compact */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-wider text-secondary mb-8">
            {t('design.colorPalette')}
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {colorPalette.map((color) => (
              <ColorCard 
                key={color.name} 
                name={color.name} 
                cssValue={color.value} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Font Specimens */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        {fonts.map((font, index) => (
          <TypographySpecimen key={font.name} font={font} index={index} />
        ))}
      </section>

      
    </div>
  )
}
