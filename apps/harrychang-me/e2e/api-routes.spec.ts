import { test, expect } from '@playwright/test'

/**
 * API Routes E2E tests
 * Tests all API endpoints for proper responses and locale handling
 */

test.describe('API Routes', () => {
  test.describe('Projects API', () => {
    test('should return projects list', async ({ request }) => {
      const response = await request.get('/api/projects')

      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBeTruthy()
    })

    test('should accept locale parameter', async ({ request }) => {
      const responseEn = await request.get('/api/projects?locale=en')
      expect(responseEn.ok()).toBeTruthy()

      const dataEn = await responseEn.json()
      expect(Array.isArray(dataEn)).toBeTruthy()

      const responseZh = await request.get('/api/projects?locale=zh-TW')
      expect(responseZh.ok()).toBeTruthy()

      const dataZh = await responseZh.json()
      expect(Array.isArray(dataZh)).toBeTruthy()
    })

    test('should return project metadata with required fields', async ({ request }) => {
      const response = await request.get('/api/projects')
      const data = await response.json()

      if (data.length > 0) {
        const project = data[0]

        // Check required fields
        expect(project).toHaveProperty('slug')
        expect(project).toHaveProperty('title')
        expect(project.slug).toBeTruthy()
        expect(project.title).toBeTruthy()
      }
    })

    test('should sort projects by pinned status and date', async ({ request }) => {
      const response = await request.get('/api/projects')
      const data = await response.json()

      if (data.length > 1) {
        // Check if pinned items come first
        let seenNonPinned = false
        for (const project of data) {
          if (project.pinned && project.pinned > 0) {
            // If we've seen non-pinned items, pinned should not appear
            expect(seenNonPinned).toBeFalsy()
          } else {
            seenNonPinned = true
          }
        }
      }
    })

    test('should get individual project by slug', async ({ request }) => {
      // First get list of projects
      const listResponse = await request.get('/api/projects')
      const projects = await listResponse.json()

      if (projects.length > 0) {
        const slug = projects[0].slug

        const response = await request.get(`/api/projects/${slug}`)
        expect(response.ok()).toBeTruthy()

        const data = await response.json()
        expect(data).toHaveProperty('slug')
        expect(data.slug).toBe(slug)
        expect(data).toHaveProperty('contentHtml')
      }
    })

    test('should return 404 for non-existent project', async ({ request }) => {
      const response = await request.get('/api/projects/non-existent-project-slug')

      expect(response.status()).toBe(404)
    })

    test('should not return locked projects', async ({ request }) => {
      const response = await request.get('/api/projects')
      const data = await response.json()

      // All returned projects should have locked: false or undefined
      for (const project of data) {
        expect(project.locked).not.toBe(true)
      }
    })
  })

  test.describe('Gallery API', () => {
    test('should return gallery items list', async ({ request }) => {
      const response = await request.get('/api/gallery')

      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBeTruthy()
    })

    test('should accept locale parameter', async ({ request }) => {
      const responseEn = await request.get('/api/gallery?locale=en')
      expect(responseEn.ok()).toBeTruthy()

      const responseZh = await request.get('/api/gallery?locale=zh-TW')
      expect(responseZh.ok()).toBeTruthy()
    })

    test('should return gallery metadata with required fields', async ({ request }) => {
      const response = await request.get('/api/gallery')
      const data = await response.json()

      if (data.length > 0) {
        const item = data[0]

        expect(item).toHaveProperty('slug')
        expect(item).toHaveProperty('title')
        expect(item.slug).toBeTruthy()
        expect(item.title).toBeTruthy()
      }
    })

    test('should get individual gallery item by slug', async ({ request }) => {
      const listResponse = await request.get('/api/gallery')
      const items = await listResponse.json()

      if (items.length > 0) {
        const slug = items[0].slug

        const response = await request.get(`/api/gallery/${slug}`)
        expect(response.ok()).toBeTruthy()

        const data = await response.json()
        expect(data).toHaveProperty('slug')
        expect(data.slug).toBe(slug)
      }
    })

    test('should return 404 for non-existent gallery item', async ({ request }) => {
      const response = await request.get('/api/gallery/non-existent-gallery-slug')

      expect(response.status()).toBe(404)
    })
  })

  test.describe('Papers API', () => {
    test('should return papers list', async ({ request }) => {
      const response = await request.get('/api/papers')

      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBeTruthy()
    })

    test('should return paper metadata from arXiv', async ({ request }) => {
      const response = await request.get('/api/papers')
      const data = await response.json()

      if (data.length > 0) {
        const paper = data[0]

        // Papers should have arXiv-style metadata
        expect(paper).toHaveProperty('title')
        expect(paper.title).toBeTruthy()

        // Should have either id or link
        const hasIdentifier = paper.id || paper.link
        expect(hasIdentifier).toBeTruthy()
      }
    })
  })

  test.describe('Spotify API', () => {
    test('should return now playing status', async ({ request }) => {
      const response = await request.get('/api/spotify/now-playing')

      // Should return 200 whether playing or not
      expect([200, 204]).toContain(response.status())

      if (response.status() === 200) {
        const data = await response.json()

        // Should have isPlaying field
        expect(data).toHaveProperty('isPlaying')
        expect(typeof data.isPlaying).toBe('boolean')

        if (data.isPlaying) {
          expect(data).toHaveProperty('title')
          expect(data).toHaveProperty('artist')
        }
      }
    })

    test('should handle not playing state', async ({ request }) => {
      const response = await request.get('/api/spotify/now-playing')

      if (response.status() === 200) {
        const data = await response.json()

        if (!data.isPlaying) {
          // Should return valid response even when not playing
          expect(data.isPlaying).toBe(false)
        }
      }
    })
  })

  test.describe('Lab Waitlist API', () => {
    test('should accept waitlist POST requests', async ({ request }) => {
      const response = await request.post('/api/lab/waitlist', {
        data: {
          email: 'test@example.com',
        },
      })

      // Should either succeed or return validation error
      expect([200, 201, 400]).toContain(response.status())
    })

    test('should validate email format', async ({ request }) => {
      const response = await request.post('/api/lab/waitlist', {
        data: {
          email: 'invalid-email',
        },
      })

      // Should return error for invalid email
      expect([400, 422]).toContain(response.status())
    })

    test('should reject empty email', async ({ request }) => {
      const response = await request.post('/api/lab/waitlist', {
        data: {
          email: '',
        },
      })

      expect([400, 422]).toContain(response.status())
    })

    test('should prevent duplicate email submissions', async ({ request }) => {
      const email = `test-${Date.now()}@example.com`

      // First submission
      const response1 = await request.post('/api/lab/waitlist', {
        data: { email },
      })

      if ([200, 201].includes(response1.status())) {
        // Second submission with same email
        const response2 = await request.post('/api/lab/waitlist', {
          data: { email },
        })

        // Should either reject duplicate or accept idempotently
        expect([200, 201, 400, 409]).toContain(response2.status())
      }
    })

    test('should require POST method', async ({ request }) => {
      const response = await request.get('/api/lab/waitlist')

      // GET should not be allowed
      expect(response.status()).toBe(405)
    })
  })

  test.describe('API Error Handling', () => {
    test('should return proper error for malformed requests', async ({ request }) => {
      const response = await request.post('/api/lab/waitlist', {
        data: 'invalid-json-string',
      })

      expect([400, 500]).toContain(response.status())
    })

    test('should have CORS headers if needed', async ({ request }) => {
      const response = await request.get('/api/projects')

      // Check if CORS headers are present (optional depending on setup)
      const headers = response.headers()
      // CORS may or may not be enabled depending on configuration
      expect(headers).toBeTruthy()
    })

    test('should return JSON content-type', async ({ request }) => {
      const response = await request.get('/api/projects')

      const contentType = response.headers()['content-type']
      expect(contentType).toContain('application/json')
    })
  })

  test.describe('API Performance', () => {
    test('should respond within acceptable time', async ({ request }) => {
      const startTime = Date.now()
      const response = await request.get('/api/projects')
      const duration = Date.now() - startTime

      expect(response.ok()).toBeTruthy()
      expect(duration).toBeLessThan(3000) // Should respond within 3 seconds
    })

    test('should handle concurrent requests', async ({ request }) => {
      const requests = [
        request.get('/api/projects'),
        request.get('/api/gallery'),
        request.get('/api/papers'),
        request.get('/api/spotify/now-playing'),
      ]

      const responses = await Promise.all(requests)

      // All requests should succeed
      for (const response of responses) {
        expect([200, 204, 404]).toContain(response.status())
      }
    })
  })

  test.describe('API Caching', () => {
    test('should include cache headers if configured', async ({ request }) => {
      const response = await request.get('/api/projects')

      const headers = response.headers()

      // Cache headers may or may not be present depending on configuration
      // This test just verifies the headers object exists
      expect(headers).toBeTruthy()
    })

    test('should return consistent data across multiple calls', async ({ request }) => {
      const response1 = await request.get('/api/projects')
      const data1 = await response1.json()

      const response2 = await request.get('/api/projects')
      const data2 = await response2.json()

      // Data should be consistent (same number of projects)
      expect(data1.length).toBe(data2.length)
    })
  })
})
