/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as getProjects } from '@/app/api/projects/route'
import { GET as getGallery } from '@/app/api/gallery/route'
import { mockProjects, mockGalleryItems } from '@/test/mock-data'

// Mock the markdown lib
vi.mock('@portfolio/lib/lib/markdown', () => ({
  getAllProjectsMetadata: vi.fn((locale: string) => mockProjects),
  getAllGalleryMetadata: vi.fn((locale: string) => mockGalleryItems),
}))

describe('API Routes', () => {
  describe('GET /api/projects', () => {
    it('should return all projects for default locale', async () => {
      const request = new Request('http://localhost:3000/api/projects')
      const response = await getProjects(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(3)
      expect(data[0].title).toBe('Test Project 1')
    })

    it('should return projects for specified locale', async () => {
      const request = new Request('http://localhost:3000/api/projects?locale=zh-TW')
      const response = await getProjects(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should handle errors gracefully', async () => {
      // Mock an error
      const { getAllProjectsMetadata } = await import('@portfolio/lib/lib/markdown')
      vi.mocked(getAllProjectsMetadata).mockImplementationOnce(() => {
        throw new Error('Test error')
      })

      const request = new Request('http://localhost:3000/api/projects')
      const response = await getProjects(request)
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })
  })

  describe('GET /api/gallery', () => {
    it('should return all gallery items', async () => {
      const request = new Request('http://localhost:3000/api/gallery')
      const response = await getGallery(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].title).toBe('Test Gallery 1')
    })

    it('should return gallery items for specified locale', async () => {
      const request = new Request('http://localhost:3000/api/gallery?locale=zh-TW')
      const response = await getGallery(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should include aspect ratio data', async () => {
      const request = new Request('http://localhost:3000/api/gallery')
      const response = await getGallery(request)
      const data = await response.json()

      const firstItem = data[0]
      expect(firstItem.aspectType).toBeDefined()
      expect(firstItem.aspectRatio).toBeDefined()
      expect(firstItem.width).toBeDefined()
      expect(firstItem.height).toBeDefined()
    })
  })
})
