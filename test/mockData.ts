import type { ProjectMetadata, GalleryItemMetadata } from '@/lib/markdown'
import type { Paper } from '@/types/paper'

export const mockProjects: ProjectMetadata[] = [
  {
    slug: 'test-project-1',
    title: 'Test Project 1',
    category: 'Development',
    subcategory: 'Web',
    description: 'A test project description',
    imageUrl: '/images/optimized/projects/test/cover-thumb.webp',
    year: '2024',
    date: '2024-01-15',
    role: 'Developer',
    technologies: ['Next.js', 'TypeScript'],
    pinned: 1,
    locked: false,
  },
  {
    slug: 'test-project-2',
    title: 'Test Project 2',
    category: 'Design',
    description: 'Another test project',
    imageUrl: '/images/optimized/projects/test2/cover-thumb.webp',
    year: '2023',
    date: '2023-12-01',
    pinned: -1,
    locked: false,
  },
  {
    slug: 'locked-project',
    title: 'Locked Project',
    category: 'Private',
    description: 'A locked project',
    imageUrl: '/images/optimized/projects/locked/cover-thumb.webp',
    year: '2024',
    date: '2024-02-01',
    pinned: -1,
    locked: true,
  },
]

export const mockGalleryItems: GalleryItemMetadata[] = [
  {
    slug: 'test-gallery-1',
    title: 'Test Gallery 1',
    description: 'A test gallery item',
    imageUrl: '/images/optimized/gallery/test1/main-thumb.webp',
    quote: 'Test quote',
    date: '2024-03-01',
    camera: 'Test Camera',
    lens: 'Test Lens',
    location: 'Test Location',
    tags: ['test', 'photography'],
    pinned: 2,
    locked: false,
    aspectType: 'v',
    aspectRatio: 0.8,
    width: 1200,
    height: 1500,
    gallery: [
      {
        url: '/images/optimized/gallery/test1/img1.webp',
        thumbnailUrl: '/images/optimized/gallery/test1/img1-thumb.webp',
        caption: 'Test image 1',
        width: 2000,
        height: 1500,
        aspectRatio: 1.33,
      },
    ],
  },
  {
    slug: 'test-gallery-2',
    title: 'Test Gallery 2',
    description: 'Another test gallery item',
    imageUrl: '/images/optimized/gallery/test2/main-thumb.webp',
    quote: 'Another test quote',
    date: '2024-02-15',
    pinned: -1,
    locked: false,
    aspectType: 'h',
    aspectRatio: 1.25,
    width: 2000,
    height: 1600,
  },
]

export const mockPapers: Paper[] = [
  {
    title: 'Test Paper on AI',
    authors: ['John Doe', 'Jane Smith'],
    date: '2024-01-10',
    url: 'https://arxiv.org/abs/2401.12345',
    source: 'arxiv',
  },
  {
    title: 'Manual Test Paper',
    authors: ['Alice Brown'],
    date: '2023-11-20',
    url: 'https://example.com/paper',
    source: 'manual',
  },
]

export const mockTranslations = {
  en: {
    common: {
      title: 'Portfolio',
      nav: {
        home: 'Home',
        projects: 'Projects',
        gallery: 'Gallery',
      },
    },
    about: {
      heading: 'About Me',
      description: 'Test about description',
    },
  },
  'zh-TW': {
    common: {
      title: '作品集',
      nav: {
        home: '首頁',
        projects: '專案',
        gallery: '相簿',
      },
    },
    about: {
      heading: '關於我',
      description: '測試關於描述',
    },
  },
}
