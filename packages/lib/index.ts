// Library utilities
// Note: arxiv, email, markdown, and prisma are server-only modules (use Node.js fs/path)
// Import them directly from their paths in server components/API routes only:
// import { getArxivPaperIds } from '@portfolio/lib/lib/arxiv'
// import { getAllProjectsMetadata } from '@portfolio/lib/lib/markdown'
// import { prisma } from '@portfolio/lib/lib/prisma'
// import { sendWaitlistConfirmationEmail } from '@portfolio/lib/lib/email'
export * from './lib/scrolling';
export * from './lib/spotify';
export * from './lib/typography';
export * from './lib/utils';

// Contexts
export * from './contexts/language-context';
export * from './contexts/navigation-context';
export * from './contexts/theme-context';

// Hooks
export * from './hooks/use-image-preloader';
export * from './hooks/use-intersection-observer';
export * from './hooks/use-mobile';
export * from './hooks/use-now-playing';
export * from './hooks/use-stable-anchor';
export * from './hooks/use-stable-hash-scroll';
export * from './hooks/use-toast';

// Types
export * from './types/paper';
