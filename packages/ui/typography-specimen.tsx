'use client'

import type { FontFamily } from '@portfolio/lib/lib/typography'
import { useLanguage } from '@portfolio/lib/contexts/LanguageContext'

interface TypographySpecimenProps {
  font: FontFamily
  index: number
}

export function TypographySpecimen({ font, index }: TypographySpecimenProps) {
  const fontClass = font.variable === '--font-ibm-plex-sans' ? 'font-ibm-plex' : 'font-space-grotesk'
  const { t } = useLanguage()

  return (
    <section
      className="mb-16"
    >
      {/* Font Name Header - Much smaller */}
      <div className="mb-8">
        <h2
          className={`${fontClass} text-3xl md:text-4xl font-bold mb-4`}
          style={{ fontWeight: Math.max(...font.weights) }}
        >
          {font.name}
        </h2>

        {/* Minimal info */}
        <div className="flex gap-6 text-white/60 text-sm">
          <span className="font-space-grotesk">{font.classification}</span>
          <span className="font-space-grotesk">{font.weights.length} weights</span>
          {font.yearDesigned && (
            <span className="font-space-grotesk">{font.yearDesigned}</span>
          )}
        </div>
      </div>

      {/* Weights - Compact display */}
      <div className="mb-12">
        <h3 className="font-space-grotesk text-sm uppercase tracking-wider text-white/40 mb-6">
          {t('design.weights')}
        </h3>
        {font.weights.map((weight) => (
          <div
            key={weight}
            className="grid grid-cols-12 gap-4 items-baseline py-3 border-b border-white/5"
          >
            <div className="col-span-2">
              <span className="font-space-grotesk text-xs text-white/40">
                {getWeightName(weight)}
              </span>
            </div>
            <div className="col-span-10">
              <p
                className={`${fontClass} text-base md:text-lg truncate`}
                style={{ fontWeight: weight }}
              >
                Packing new knowledge, I vex, judge, quiz, from bytes.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Character Set - Simplified */}
      <div className="mb-12">
        <h3 className="font-space-grotesk text-sm uppercase tracking-wider text-white/40 mb-6">
          {t('design.characterSet')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-space-grotesk text-xs text-white/40 mb-2">{t('design.uppercase')}</p>
            <p className={`${fontClass} text-lg md:text-xl tracking-wide break-all`}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
          </div>
          <div>
            <p className="font-space-grotesk text-xs text-white/40 mb-2">{t('design.lowercase')}</p>
            <p className={`${fontClass} text-lg md:text-xl tracking-wide break-all`}>
              abcdefghijklmnopqrstuvwxyz
            </p>
          </div>
          <div>
            <p className="font-space-grotesk text-xs text-white/40 mb-2">{t('design.numbers')}</p>
            <p className={`${fontClass} text-lg md:text-xl tracking-wide`}>
              0123456789
            </p>
          </div>
          <div>
            <p className="font-space-grotesk text-xs text-white/40 mb-2">{t('design.special')}</p>
            <p className={`${fontClass} text-lg md:text-xl tracking-wide break-all`}>
              !@#$%^&*()_+-=↗↙[]{}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function getWeightName(weight: number): string {
  const weightNames: Record<number, string> = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black',
  }
  return weightNames[weight] || `${weight}`
}
