'use client'

import { TypographySpecimen } from '@portfolio/ui/typography-specimen'
import { getAllFontFamilies, colorSystem } from '@portfolio/lib/lib/typography'
import { useLanguage } from '@portfolio/lib/contexts/LanguageContext'

export default function TypographyPageClient() {
  const { t } = useLanguage()
  const fonts = getAllFontFamilies()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Color System - Compact */}
      <section className="container mx-auto px-4 md:px-8 py-12 border-t border-white/10">
        <div>
          <h2 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-8">
            {t('design.colorPalette')}
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {[
              { name: 'Background', hex: '#0A0A0A' },
              { name: 'Foreground', hex: '#FFFFFF' },
              { name: 'Primary', hex: '#FFFFFF' },
              { name: 'Secondary', hex: '#4F4F4F' },
              { name: 'Muted', hex: '#262626' },
              { name: 'Accent', hex: '#D8F600' },
              { name: 'Border', hex: '#262626' },
            ].map((color, idx) => (
              <div
                key={color.name}
                className="space-y-2"
              >
                <div
                  className="w-full aspect-square rounded border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <p className="font-space-grotesk text-xs">{color.name}</p>
                  <p className="font-space-grotesk text-xs text-white/40">
                    {color.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Font Specimens */}
      <section className="container mx-auto px-4 md:px-8 py-12 border-t border-white/10">
        {fonts.map((font, index) => (
          <TypographySpecimen key={font.name} font={font} index={index} />
        ))}
      </section>

      {/* Type Scale - Simplified */}
      <section className="container mx-auto px-4 md:px-8 py-12 border-t border-white/10">
        <div>
          <h2 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-8">
            {t('design.typeScale')}
          </h2>
          <div className="space-y-4">
            {[
              { size: 'text-4xl', rem: '2.25rem', usageKey: 'display' },
              { size: 'text-3xl', rem: '1.875rem', usageKey: 'h1' },
              { size: 'text-2xl', rem: '1.5rem', usageKey: 'h2' },
              { size: 'text-xl', rem: '1.25rem', usageKey: 'h3' },
              { size: 'text-lg', rem: '1.125rem', usageKey: 'largeBody' },
              { size: 'text-base', rem: '1rem', usageKey: 'body' },
              { size: 'text-sm', rem: '0.875rem', usageKey: 'small' },
              { size: 'text-xs', rem: '0.75rem', usageKey: 'caption' },
            ].map((scale) => (
              <div
                key={scale.rem}
                className="grid grid-cols-12 gap-4 items-baseline py-3 border-b border-white/5"
              >
                <span className="col-span-2 font-space-grotesk text-xs text-white/40">
                  {scale.rem}
                </span>
                <span className="col-span-2 font-space-grotesk text-xs text-white/40">
                  {scale.usageKey === 'h1' || scale.usageKey === 'h2' || scale.usageKey === 'h3' ? scale.usageKey.toUpperCase() : t(`design.${scale.usageKey}`)}
                </span>
                <p className={`col-span-8 font-ibm-plex ${scale.size} truncate`}>
                  Packing new knowledge, I vex, judge, quiz, from bytes.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
