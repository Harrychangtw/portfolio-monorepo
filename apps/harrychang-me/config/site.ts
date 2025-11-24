/**
 * Site Configuration for Harry Chang Portfolio
 * Centralized configuration for URLs, metadata, and site-specific constants
 */

export const siteConfig = {
  // Base URLs
  url: 'https://www.harrychang.me',
  labUrl: 'https://lab.harrychang.me',

  // Personal Information
  author: {
    name: 'Harry Chang',
    alternateName: '張祺煒',
    email: 'chiwei@harrychang.me',
    jobTitle: 'Developer & Researcher',
    description: 'Harry Chang (張祺煒) builds new worlds at the intersection of AI, code, and visual storytelling',
  },

  // Metadata
  metadata: {
    title: {
      template: '%s | Harry Chang',
      default: 'Harry Chang 張祺煒 | Portfolio',
    },
    description: 'Harry Chang (張祺煒) builds new worlds at the intersection of AI, code, and visual storytelling. Explore his portfolio of software development, photography, and design.',
    keywords: ['Harry Chang', '張祺煒', 'portfolio', 'photography', 'software development', 'design', 'research', 'AI', 'machine learning'] as string[],
    siteName: 'Harry Chang Portfolio',
  },

  // Social Media & External Links
  social: {
    github: 'https://github.com/Harrychangtw',
    linkedin: 'https://www.linkedin.com/in/chi-wei-chang-928408375/',
    instagram: 'https://www.instagram.com/pomelo_chang_08/',
    spotify: 'https://open.spotify.com/user/1b7kc6j0zerk49mrv80pwdd96?si=7d5a6e1a4fa34de3',
    discord: 'https://discord.com/users/836567989209661481',
    letterboxd: 'https://boxd.it/fSKuF',
  },

  // External Resources
  external: {
    cv: 'https://drive.google.com/file/d/1PjmhEmPMKH1PZCxUg-Wv0fzqvnbKj8Su/view?usp=drive_link',
    calendar: 'https://calendar.notion.so/meet/harry-chang/ybit2gkx',
  },

  // API & Service URLs
  api: {
    arxiv: 'http://export.arxiv.org/api/query?id_list=',
    spotify: {
      token: 'https://accounts.spotify.com/api/token',
      nowPlaying: 'https://api.spotify.com/v1/me/player/currently-playing',
    },
  },

  // Media & Assets
  media: {
    ogImage: {
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Harry Chang Portfolio',
    },
    youtubeEmbedBase: 'https://www.youtube.com/embed/',
    googleDriveEmbedBase: 'https://drive.google.com/file/d/',
  },

  // SEO & Verification
  verification: {
    google: 'googleb0d95f7ad2ffc31f',
  },

  // Locales
  locales: {
    default: 'en',
    supported: ['en', 'zh-TW'] as const,
  },

  // Skills & Knowledge
  skills: ['Software Development', 'Photography', 'Design', 'Artificial Intelligence', 'Machine Learning', 'Research'] as string[],
}

export type SiteConfig = typeof siteConfig
