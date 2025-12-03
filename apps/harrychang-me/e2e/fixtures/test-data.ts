/**
 * Test data fixtures for E2E tests
 */

export const TEST_PROJECTS = {
  // These should match actual projects in your content/ directory
  // Update with real project slugs from your content
  sampleProject: 'sample-project',
}

export const TEST_GALLERY_ITEMS = {
  // These should match actual gallery items in your content/ directory
  // Update with real gallery slugs from your content
  sampleGallery: 'sample-gallery',
}

export const TEST_ROUTES = {
  main: {
    home: '/',
    projects: '/#projects',
    gallery: '/#gallery',
    uses: '/uses',
    manifesto: '/manifesto',
    paperReading: '/paper-reading',
    design: '/design',
  },
  lab: {
    home: '/',
  },
}

export const TRANSLATION_KEYS = {
  // Common translation keys to test
  en: {
    projects: 'Projects',
    gallery: 'Gallery',
  },
  'zh-TW': {
    projects: '專案',
    gallery: '作品集',
  },
}

export const TEST_LOCALES = ['en', 'zh-TW'] as const

export const SHARED_PATHS = [
  '/api/',
  '/locales/',
  '/images/',
  '/_next/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

/**
 * Mock API responses for testing
 */
export const MOCK_API_RESPONSES = {
  projects: [
    {
      slug: 'test-project-1',
      title: 'Test Project 1',
      category: 'Design',
      description: 'A test project for E2E testing',
      imageUrl: '/images/projects/test/image.webp',
      date: '2024-01-15',
      year: '2024',
      pinned: 1,
      locked: false,
      featured: true,
    },
    {
      slug: 'test-project-2',
      title: 'Test Project 2',
      category: 'Development',
      description: 'Another test project',
      imageUrl: '/images/projects/test2/image.webp',
      date: '2024-01-10',
      year: '2024',
      pinned: -1,
      locked: false,
      featured: false,
    },
  ],
  gallery: [
    {
      slug: 'test-gallery-1',
      title: 'Test Gallery 1',
      category: 'Photography',
      description: 'A test gallery item',
      imageUrl: '/images/gallery/test/image.webp',
      date: '2024-01-15',
      year: '2024',
      pinned: 1,
      locked: false,
    },
  ],
  papers: [
    {
      id: 'arxiv:2401.00000',
      title: 'Test Paper',
      authors: ['Test Author'],
      summary: 'A test paper summary',
      published: '2024-01-01',
      link: 'https://arxiv.org/abs/2401.00000',
    },
  ],
  nowPlaying: {
    isPlaying: true,
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    albumImageUrl: 'https://example.com/album.jpg',
    songUrl: 'https://open.spotify.com/track/test',
  },
}

/**
 * Expected meta tags for different pages
 */
export const EXPECTED_META_TAGS = {
  home: {
    title: 'Harry Chang',
    description: 'portfolio',
    ogImage: true,
  },
  projects: {
    title: 'Projects',
    description: 'projects',
    ogImage: true,
  },
  gallery: {
    title: 'Gallery',
    description: 'gallery',
    ogImage: true,
  },
  lab: {
    title: 'Lab',
    description: 'lab',
    ogImage: true,
  },
}

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  header: 'header',
  footer: 'footer',
  navigation: 'nav',
  languageToggle: '[data-testid="language-toggle"]',
  projectCard: '[data-testid="project-card"]',
  galleryCard: '[data-testid="gallery-card"]',
  mainContent: 'main',
}

/**
 * Expected viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  wide: { width: 2560, height: 1440 },
}

/**
 * Animation timing constants
 */
export const ANIMATION_TIMINGS = {
  fast: 300,
  medium: 500,
  slow: 1000,
  framerMotion: 1000,
}

/**
 * Known console warnings/errors to ignore in tests
 */
export const ALLOWED_CONSOLE_PATTERNS = [
  'Download the React DevTools',
  'Warning: ReactDOM.render',
  // Add other known acceptable warnings here
]
