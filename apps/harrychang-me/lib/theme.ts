// Theme configuration for harrychang-me app
import { harrychangTheme } from '@portfolio/config/themes/harrychang'

export const theme = harrychangTheme

// CSS variables helper for inline styles
export const getCSSVariables = () => ({
  '--background': theme.colors.background,
  '--foreground': theme.colors.foreground,
  '--card': theme.colors.card,
  '--card-foreground': theme.colors['card-foreground'],
  '--popover': theme.colors.popover,
  '--popover-foreground': theme.colors['popover-foreground'],
  '--primary': theme.colors.primary,
  '--primary-foreground': theme.colors['primary-foreground'],
  '--secondary': theme.colors.secondary,
  '--secondary-foreground': theme.colors['secondary-foreground'],
  '--muted': theme.colors.muted,
  '--muted-foreground': theme.colors['muted-foreground'],
  '--accent': theme.colors.accent,
  '--accent-foreground': theme.colors['accent-foreground'],
  '--destructive': theme.colors.destructive,
  '--destructive-foreground': theme.colors['destructive-foreground'],
  '--border': theme.colors.border,
  '--input': theme.colors.input,
  '--ring': theme.colors.ring,
  '--radius': theme.radius,
  '--pixel-accent': `hsl(${theme.colors.accent})`,
  '--accent-color': `hsl(${theme.colors.accent})`,
  '--column-spacing': 'max(0.5rem, 0.2vw)',
})

// Color value getters for components that need explicit values
export const colors = {
  background: `hsl(${theme.colors.background})`,
  foreground: `hsl(${theme.colors.foreground})`,
  card: `hsl(${theme.colors.card})`,
  cardForeground: `hsl(${theme.colors['card-foreground']})`,
  popover: `hsl(${theme.colors.popover})`,
  popoverForeground: `hsl(${theme.colors['popover-foreground']})`,
  primary: `hsl(${theme.colors.primary})`,
  primaryForeground: `hsl(${theme.colors['primary-foreground']})`,
  secondary: `hsl(${theme.colors.secondary})`,
  secondaryForeground: `hsl(${theme.colors['secondary-foreground']})`,
  muted: `hsl(${theme.colors.muted})`,
  mutedForeground: `hsl(${theme.colors['muted-foreground']})`,
  accent: `hsl(${theme.colors.accent})`,
  accentForeground: `hsl(${theme.colors['accent-foreground']})`,
  destructive: `hsl(${theme.colors.destructive})`,
  destructiveForeground: `hsl(${theme.colors['destructive-foreground']})`,
  border: `hsl(${theme.colors.border})`,
  input: `hsl(${theme.colors.input})`,
  ring: `hsl(${theme.colors.ring})`,
}
