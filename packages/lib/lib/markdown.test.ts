import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs' // Import the actual module to spy on
import path from 'node:path'
import { imageSize } from 'image-size'
import {
  getAllProjectsMetadata,
  getAllGalleryMetadata,
  getProjectData,
  getGalleryItemData,
} from './markdown'

// Mock external dependencies, but not built-ins
vi.mock('image-size', () => ({
  imageSize: vi.fn(),
}))

const MOCK_PROJECT_CONTENT_PATH = path.join(process.cwd(), 'content/projects')
const MOCK_GALLERY_CONTENT_PATH = path.join(process.cwd(), 'content/gallery')
const MOCK_PUBLIC_PATH = path.join(process.cwd(), 'public')

const mockProjectFiles = {
  'project-a.md': `---
title: "Project A"
pinned: 1
date: "2024-01-01"
imageUrl: "/images/projects/project-a/cover.jpg"
description: "Description A"
category: "Web"
year: "2024"
---
Content for Project A
![An image](/images/projects/project-a/image1.png)
`,
  'project-b.md': `---
title: "Project B"
pinned: -1
date: "2024-05-15"
imageUrl: "/images/projects/project-b/cover.png"
description: "Description B"
category: "Mobile"
year: "2024"
---
Content for Project B
`,
  'project-c_zh-tw.md': `---
title: "項目 C"
pinned: 0
date: "2023-12-25"
imageUrl: "/images/projects/project-c/cover.webp"
description: "描述 C"
category: "Web"
year: "2023"
---
項目 C 的內容
`,
  'project-c.md': `---
title: "Project C"
pinned: 0
date: "2023-12-25"
imageUrl: "/images/projects/project-c/cover.webp"
description: "Description C"
category: "Web"
year: "2023"
---
Content for Project C
`,
}

const mockGalleryFiles = {
  'photo-a.md': `---
title: "Sunrise"
pinned: 0
date: "2024-07-20"
imageUrl: "/images/gallery/photo-a/main.jpg"
description: "A beautiful sunrise"
quote: "Morning has broken"
---
This is a photo of a sunrise.
`,
  'photo-b_zh-tw.md': `---
title: "城市之夜"
pinned: -1
date: "2024-06-10"
imageUrl: "/images/gallery/photo-b/main.png"
description: "夜晚的城市景觀"
quote: "不夜城"
---
這是一張城市夜景照片。
`,
  'photo-b.md': `---
title: "City Night"
pinned: -1
date: "2024-06-10"
imageUrl: "/images/gallery/photo-b/main.png"
description: "Cityscape at night"
quote: "The city that never sleeps"
---
This is a photo of a cityscape at night.
`,
}

const mockVideoContent = `---
title: "Video Project"
date: "2024-03-01"
imageUrl: "/images/projects/video/cover.jpg"
---
![YouTube Video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
![Google Drive Video](https://drive.google.com/file/d/1B-Q4nAvwB-YFGp_a-Jb9G5HaR8H7jL8s)
`

describe('lib/markdown.ts', () => {
  beforeEach(() => {
    // Use spyOn to intercept methods on the actual 'fs' module
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      const p_str = p.toString()
      if (p_str.startsWith(MOCK_PUBLIC_PATH)) return true // Assume image files exist
      if ([MOCK_PROJECT_CONTENT_PATH, MOCK_GALLERY_CONTENT_PATH].includes(p_str)) return true
      
      const baseName = path.basename(p_str)
      if (baseName === 'project-c_zh-tw.md' || baseName === 'photo-b_zh-tw.md') return true
      if (baseName === 'video-project.md') return true
      
      return mockProjectFiles.hasOwnProperty(baseName) || mockGalleryFiles.hasOwnProperty(baseName)
    })

    vi.spyOn(fs, 'readdirSync').mockImplementation((p) => {
      if (p.toString() === MOCK_PROJECT_CONTENT_PATH) return Object.keys(mockProjectFiles) as any
      if (p.toString() === MOCK_GALLERY_CONTENT_PATH) return Object.keys(mockGalleryFiles) as any
      return []
    })

    vi.spyOn(fs, 'readFileSync').mockImplementation((p) => {
      const fileName = path.basename(p.toString())
      if (fileName === 'video-project.md') return mockVideoContent
      return (mockProjectFiles as any)[fileName] || (mockGalleryFiles as any)[fileName] || ''
    })
    
    // Also spy on mkdirSync to prevent it from actually running
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)

    // Mock external dependency
    vi.mocked(imageSize).mockReturnValue({ width: 1200, height: 800 })
  })

  afterEach(() => {
    // Restore all spies and mocks after each test
    vi.restoreAllMocks()
  })

  describe('getAllProjectsMetadata', () => {
    it('should return English projects for "en" locale, sorted by pin and date', () => {
      const metadata = getAllProjectsMetadata('en')
      expect(metadata).toHaveLength(3)

      // Corrected sorting: lower pin number is higher priority
      expect(metadata[0].slug).toBe('project-c') // Pinned: 0
      expect(metadata[1].slug).toBe('project-a') // Pinned: 1
      expect(metadata[2].slug).toBe('project-b') // Pinned: -1 (unpinned), sorts by date
      
      expect(metadata[1].imageUrl).toBe('/images/optimized/projects/project-a/cover-thumb.webp')
    })

    it('should return Chinese projects for "zh-TW" locale, falling back to English', () => {
      const metadata = getAllProjectsMetadata('zh-TW')
      expect(metadata).toHaveLength(3)
      
      const slugs = metadata.map(p => p.slug)
      expect(slugs).toContain('project-a')
      expect(slugs).toContain('project-b')
      expect(slugs).toContain('project-c_zh-tw')
      
      const projectC = metadata.find(p => p.slug === 'project-c_zh-tw')
      expect(projectC?.title).toBe('項目 C')
    })
  })

  describe('getAllGalleryMetadata', () => {
    it('should return English gallery items for "en" locale, sorted correctly', () => {
      const metadata = getAllGalleryMetadata('en')
      expect(metadata).toHaveLength(2)
      expect(metadata[0].slug).toBe('photo-a') // Pinned: 0
      expect(metadata[1].slug).toBe('photo-b') // Pinned: -1
    })

    it('should calculate aspect ratio and dimensions for gallery items', () => {
      vi.mocked(imageSize).mockReturnValue({ width: 1600, height: 900 })
      const metadata = getAllGalleryMetadata('en')
      const photoA = metadata.find(item => item.slug === 'photo-a')
      expect(photoA).toBeDefined()
      expect(photoA?.width).toBe(1600)
      expect(photoA?.height).toBe(900)
      expect(photoA?.aspectRatio).toBe(Number((1600 / 900).toFixed(4)))
      expect(photoA?.aspectType).toBe('h')
    })

    it('should return Chinese gallery items for "zh-TW" locale', () => {
      const metadata = getAllGalleryMetadata('zh-TW')
      expect(metadata.length).toBeGreaterThan(0)
      const photoB = metadata.find(item => item.slug === 'photo-b_zh-tw')
      expect(photoB).toBeDefined()
      expect(photoB?.title).toBe('城市之夜')
    })
  })

  describe('getProjectData', () => {
    it('should return full project data and rendered HTML content', async () => {
      const data = await getProjectData('project-a')
      expect(data).not.toBeNull()
      expect(data?.slug).toBe('project-a')
      expect(data?.imageUrl).toBe('/images/optimized/projects/project-a/cover.webp')
      expect(data?.imageWidth).toBe(1200)
      expect(data?.contentHtml).toContain('src="/images/optimized/projects/project-a/image1.webp"')
    })

    it('should transform video links into embeds', async () => {
      const data = await getProjectData('video-project')
      expect(data?.contentHtml).toContain('data-type="youtube"')
      expect(data?.contentHtml).toContain('data-src="https://www.youtube.com/embed/dQw4w9WgXcQ"')
      expect(data?.contentHtml).toContain('data-type="googledrive"')
      expect(data?.contentHtml).toContain('data-src="https://drive.google.com/file/d/1B-Q4nAvwB-YFGp_a-Jb9G5HaR8H7jL8s/preview"')
    })

    it('should return null if slug does not exist', async () => {
      // Override the spy for this specific test
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)
      const data = await getProjectData('non-existent-slug')
      expect(data).toBeNull()
    })
  })

  describe('getGalleryItemData', () => {
    it('should return full gallery item data', async () => {
      const data = await getGalleryItemData('photo-a')
      expect(data).not.toBeNull()
      expect(data?.slug).toBe('photo-a')
      expect(data?.title).toBe('Sunrise')
      expect(data?.width).toBe(1200)
      expect(data?.contentHtml.trim()).toBe('<p>This is a photo of a sunrise.</p>')
    })
  })
})
