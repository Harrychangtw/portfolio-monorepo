/**
 * UI Constants
 * Centralized UI-related constants for layout, spacing, and positioning
 */

export const UI = {
  // Tooltip
  tooltip: {
    offsetY: -40,
    padding: {
      x: 12, // px-3
      y: 6,  // py-1.5
    },
  },

  // Header
  header: {
    height: 64, // h-16 = 4rem = 64px
    paddingTop: 64, // pt-16 used in layout
  },

  // Motion effects
  motion: {
    hoverLift: -2, // y: -2 for hover lift effect
  },

  // Z-index layers
  zIndex: {
    tooltip: 50,
    header: 40,
    modal: 100,
    overlay: 90,
  },

  // Common breakpoints (matches Tailwind defaults)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const

export type UIConfig = typeof UI
