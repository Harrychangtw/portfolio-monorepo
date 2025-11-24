/**
 * Site Configuration for Emily Chang Portfolio
 * Centralized configuration for URLs, metadata, and site-specific constants
 */

export const siteConfig = {
  // Base URLs
  url: 'https://www.emilychang.me',

  // Personal Information
  author: {
    name: 'Emily Chang',
    email: 'koding.chang@gmail.com',
    jobTitle: 'Designer & Artist',
    description: 'Emily Chang explores the intersection of design, art, and creative expression',
  },

  // Metadata
  metadata: {
    title: {
      template: '%s | Emily Chang',
      default: 'Emily Chang | Portfolio',
    },
    description: 'Emily Chang explores the intersection of design, art, and creative expression. Explore her portfolio of design work, creations, and artistic endeavors.',
    keywords: ['Emily Chang', 'portfolio', 'design', 'art', 'illustration', 'creative'] as string[],
    siteName: 'Emily Chang Portfolio',
  },

  // Skills & Knowledge
  skills: ['Design', 'Art', 'Illustration', 'Creative Direction'] as string[],

  // Social Media & External Links
  social: {
    artInstagram: {
      name: 'Art Instagram',
      url: 'https://www.instagram.com/weirdoo_club?igsh=ZjE2ZnR1anFneWp6&utm_source=qr',
    },
    personalInstagram: {
      name: 'Personal Instagram',
      url: 'https://www.instagram.com/dumbass_emi_?igsh=MXR4dTB0emk2c2h0dQ%3D%3D&utm_source=qr',
    },
    spotify: {
      name: 'Spotify',
      url: 'https://open.spotify.com/user/snth1yq0x1gilq0h52rsudjed?si=37WuZ9pOQ_2EwPdnVEYwww',
    },
    beli: 'https://beliapp.co/app/emilysushigod',
  },

  // Navigation Links
  navigation: [
    { id: 'about', name: 'About', href: '/#about' },
    { id: 'projects', name: 'Projects', href: '/#projects' },
    { id: 'canvas', name: 'Canvas', href: '/#canvas' },
    { id: 'sketches', name: 'Sketches', href: '/#sketches' },
  ] as const,

  // Media & Assets
  media: {
    ogImage: {
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Emily Chang Portfolio',
    },
    footerIcon: '/footer_icon.png',
    footerIconDimensions: {
      width: 446,
      height: 150,
      displayHeight: 96,
    },
  },

  // Developer Credits
  developer: {
    name: 'Harry Chang',
    url: 'https://harrychang.me',
  },

  // Locales
  locales: {
    default: 'en',
    supported: ['en'] as const,
  },
}

export type SiteConfig = typeof siteConfig
