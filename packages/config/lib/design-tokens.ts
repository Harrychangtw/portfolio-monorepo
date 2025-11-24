/**
 * Design Tokens
 * Standardized spacing, typography, and design values for consistent UI
 */

export const DESIGN_TOKENS = {
  // Spacing scale (in rem/tailwind units)
  spacing: {
    section: {
      mobile: 'py-12',
      desktop: 'md:py-16',
      large: 'lg:py-24',
    },
    container: {
      mobile: 'px-4',
      tablet: 'sm:px-6',
      desktop: 'lg:px-8',
    },
    gap: {
      xs: 'gap-2',      // 0.5rem / 8px
      sm: 'gap-4',      // 1rem / 16px
      md: 'gap-6',      // 1.5rem / 24px
      lg: 'gap-8',      // 2rem / 32px
      xl: 'gap-12',     // 3rem / 48px
      '2xl': 'gap-16',  // 4rem / 64px
    },
  },

  // Typography scale
  typography: {
    size: {
      xs: 'text-xs',      // 0.75rem / 12px
      sm: 'text-sm',      // 0.875rem / 14px
      base: 'text-base',  // 1rem / 16px
      lg: 'text-lg',      // 1.125rem / 18px
      xl: 'text-xl',      // 1.25rem / 20px
      '2xl': 'text-2xl',  // 1.5rem / 24px
      '3xl': 'text-3xl',  // 1.875rem / 30px
      '4xl': 'text-4xl',  // 2.25rem / 36px
      '5xl': 'text-5xl',  // 3rem / 48px
    },
    weight: {
      normal: 'font-normal',      // 400
      medium: 'font-medium',      // 500
      semibold: 'font-semibold',  // 600
      bold: 'font-bold',          // 700
    },
    lineHeight: {
      tight: 'leading-tight',     // 1.25
      normal: 'leading-normal',   // 1.5
      relaxed: 'leading-relaxed', // 1.625
      loose: 'leading-loose',     // 2
    },
  },

  // Layout
  layout: {
    header: {
      height: 64, // px
      heightClass: 'h-16',
      paddingTop: 'pt-16', // To account for fixed header
    },
    maxWidth: {
      sm: 'max-w-sm',    // 24rem / 384px
      md: 'max-w-md',    // 28rem / 448px
      lg: 'max-w-lg',    // 32rem / 512px
      xl: 'max-w-xl',    // 36rem / 576px
      '2xl': 'max-w-2xl', // 42rem / 672px
      '4xl': 'max-w-4xl', // 56rem / 896px
      '6xl': 'max-w-6xl', // 72rem / 1152px
      '7xl': 'max-w-7xl', // 80rem / 1280px
      full: 'max-w-full',
    },
    grid: {
      cols2: 'grid-cols-1 md:grid-cols-2',
      cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    },
  },

  // Border radius
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',     // 0.125rem / 2px
    md: 'rounded-md',     // 0.375rem / 6px
    lg: 'rounded-lg',     // 0.5rem / 8px
    xl: 'rounded-xl',     // 0.75rem / 12px
    '2xl': 'rounded-2xl', // 1rem / 16px
    full: 'rounded-full',
  },

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    none: 'shadow-none',
  },
} as const

export type DesignTokens = typeof DESIGN_TOKENS
