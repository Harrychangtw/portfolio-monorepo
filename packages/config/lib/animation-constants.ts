/**
 * Animation Constants
 * Centralized timing and animation values for consistent UI animations
 */

export const ANIMATION = {
  // Duration values (in seconds)
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.2,
    medium: 0.3,
    slow: 0.5,
    verySlow: 1,
  },

  // Delay values (in seconds)
  delay: {
    none: 0,
    short: 0.1,
    medium: 0.2,
    long: 0.5,
  },

  // Easing functions
  easing: {
    easeOut: 'easeOut',
    easeIn: 'easeIn',
    easeInOut: 'easeInOut',
    linear: 'linear',
  },

  // Common animation variants
  stagger: {
    default: 0.1,
    fast: 0.05,
    slow: 0.2,
  },

  // Scale values
  scale: {
    subtle: 0.95,
    normal: 1,
    hover: 1.05,
  },

  // Opacity values
  opacity: {
    hidden: 0,
    visible: 1,
    subtle: 0.5,
  },
} as const

export type AnimationConfig = typeof ANIMATION
