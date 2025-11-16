/**
 * Typography system analyzer for the portfolio site
 * Extracts and organizes all font families, weights, sizes, and usage patterns
 */

export interface FontFamily {
  name: string
  variable: string
  classification: string
  weights: number[]
  usage: 'primary' | 'display' | 'accent'
  description: string
  yearDesigned?: string
  designer?: string
}

export interface FontSize {
  name: string
  value: string
  remValue: number
  usage: string
}

export interface FontWeight {
  name: string
  value: number
  usage: string
}

export const fontFamilies: FontFamily[] = [
  {
    name: 'IBM Plex Sans',
    variable: '--font-ibm-plex-sans',
    classification: 'Neo-Grotesque Sans-Serif',
    weights: [100, 200, 300, 400, 500, 600, 700],
    usage: 'primary',
    description: 'A versatile sans-serif typeface designed by IBM to reflect their brand spirit, philosophy and principles. With excellent readability and a modern, approachable character, IBM Plex Sans serves as the primary body text throughout the portfolio.',
    yearDesigned: '2017',
    designer: 'Mike Abbink, Bold Monday',
  },
  {
    name: 'Space Grotesk',
    variable: '--font-space-grotesk',
    classification: 'Display Grotesque',
    weights: [300, 400, 500, 600, 700],
    usage: 'display',
    description: 'A proportional variant of Space Mono designed for display purposes. With its geometric forms and distinctive character, Space Grotesk is used for all headings, navigation elements, and prominent UI text, creating a strong visual hierarchy and modern aesthetic.',
    yearDesigned: '2018',
    designer: 'Florian Karsten',
  },
]

export const fontSizes: FontSize[] = [
  { name: 'text-xs', value: '0.75rem', remValue: 0.75, usage: 'Small labels, captions, metadata' },
  { name: 'text-sm', value: '0.875rem', remValue: 0.875, usage: 'Secondary text, form labels, small UI elements' },
  { name: 'text-base', value: '1rem', remValue: 1, usage: 'Body text, standard UI text, navigation links' },
  { name: 'text-lg', value: '1.125rem', remValue: 1.125, usage: 'Emphasized body text, section headings' },
  { name: 'text-xl', value: '1.25rem', remValue: 1.25, usage: 'Large body text, subheadings, menu items' },
  { name: 'text-2xl', value: '1.5rem', remValue: 1.5, usage: 'H3 headings, card titles' },
  { name: 'text-3xl', value: '1.875rem', remValue: 1.875, usage: 'H2 headings, page titles' },
  { name: 'text-4xl', value: '2.25rem', remValue: 2.25, usage: 'H1 headings, hero titles' },
  { name: 'text-5xl', value: '3rem', remValue: 3, usage: 'Large hero text, feature headings' },
  { name: 'text-6xl', value: '3.75rem', remValue: 3.75, usage: 'Extra large display text' },
  { name: 'text-7xl', value: '4.5rem', remValue: 4.5, usage: 'Massive display text (rarely used)' },
  { name: 'text-8xl', value: '6rem', remValue: 6, usage: 'Ultra large display text (rarely used)' },
]

export const fontWeights: FontWeight[] = [
  { name: 'Thin', value: 100, usage: 'Minimal emphasis, decorative text' },
  { name: 'Extra Light', value: 200, usage: 'Subtle emphasis, secondary content' },
  { name: 'Light', value: 300, usage: 'Light body text, descriptive content' },
  { name: 'Regular', value: 400, usage: 'Standard body text, default weight' },
  { name: 'Medium', value: 500, usage: 'Emphasized text, active states, metadata' },
  { name: 'Semi Bold', value: 600, usage: 'Subheadings, important UI elements' },
  { name: 'Bold', value: 700, usage: 'Headings, strong emphasis, calls to action' },
]

export const letterSpacings = [
  { name: 'Tighter', value: '-0.05em', usage: 'Large display text (tracking-tighter)' },
  { name: 'Tight', value: '-0.025em', usage: 'Headings (tracking-tight)' },
  { name: 'Normal', value: '0', usage: 'Body text (tracking-normal)' },
  { name: 'Wide', value: '0.025em', usage: 'Uppercase labels (tracking-wide)' },
  { name: 'Wider', value: '0.05em', usage: 'Spaced headings (tracking-wider)' },
  { name: 'Widest', value: '0.1em', usage: 'Maximum spacing (tracking-widest)' },
]

export const lineHeights = [
  { name: 'None', value: '1', usage: 'Display text, tight layouts (leading-none)' },
  { name: 'Tight', value: '1.25', usage: 'Headings (leading-tight)' },
  { name: 'Snug', value: '1.375', usage: 'Subheadings (leading-snug)' },
  { name: 'Normal', value: '1.5', usage: 'Body text (leading-normal)' },
  { name: 'Relaxed', value: '1.625', usage: 'Comfortable reading (leading-relaxed)' },
  { name: 'Loose', value: '2', usage: 'Maximum line spacing (leading-loose)' },
]

export const colorSystem = {
  background: 'hsl(0 0% 4%)', // #0A0A0A
  foreground: 'hsl(0 0% 100%)', // #FFFFFF
  primary: 'hsl(0 0% 100%)', // #FFFFFF
  secondary: 'hsl(0 0% 31%)', // #4F4F4F
  muted: 'hsl(0 0% 15%)', // #262626
  accent: '#D8F600', // Lime accent color
  border: 'hsl(0 0% 15%)', // #262626
}

export const alphabetSample = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const lowercaseSample = 'abcdefghijklmnopqrstuvwxyz'
export const numberSample = '0123456789'
export const specialCharsSample = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
export const pangram = 'The quick brown fox jumps over the lazy dog'
export const sampleText = `Introducing ${fontFamilies[0].name}, a versatile ${fontFamilies[0].classification} typeface that combines modern aesthetics with exceptional functionality. With ${fontFamilies[0].weights.length} carefully crafted weights, this font family offers designers the flexibility to create harmonious hierarchies and expressive layouts across digital and print media.`

/**
 * Get all unique font sizes used in the project
 */
export function getAllFontSizes(): FontSize[] {
  return fontSizes
}

/**
 * Get all unique font weights used in the project
 */
export function getAllFontWeights(): FontWeight[] {
  return fontWeights
}

/**
 * Get the primary font family
 */
export function getPrimaryFont(): FontFamily {
  return fontFamilies.find((f) => f.usage === 'primary') || fontFamilies[0]
}

/**
 * Get the display font family
 */
export function getDisplayFont(): FontFamily {
  return fontFamilies.find((f) => f.usage === 'display') || fontFamilies[1]
}

/**
 * Get all font families
 */
export function getAllFontFamilies(): FontFamily[] {
  return fontFamilies
}

/**
 * Generate a character set display string
 */
export function getCharacterSet(): {
  uppercase: string
  lowercase: string
  numbers: string
  special: string
  pangram: string
} {
  return {
    uppercase: alphabetSample,
    lowercase: lowercaseSample,
    numbers: numberSample,
    special: specialCharsSample,
    pangram: pangram,
  }
}
