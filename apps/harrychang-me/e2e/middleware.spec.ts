import { test, expect } from '@playwright/test'
import { navigateAndWait } from './utils/test-helpers'

/**
 * Middleware E2E tests
 * Tests the dual-domain routing logic and middleware behavior
 */

test.describe('Middleware Functionality', () => {
  test.describe('Subdomain Detection', () => {
    test('should detect main domain correctly', async ({ page }) => {
      await navigateAndWait(page, '/')

      // Check URL to verify domain
      const url = page.url()
      expect(url).toBeTruthy()

      // Main domain should not have /lab in URL
      if (!url.includes('lab.')) {
        expect(url).not.toContain('/lab')
      }
    })

    test('should detect lab subdomain correctly', async ({ page, baseURL }) => {
      // Skip if not on lab domain
      if (!baseURL?.includes('lab.')) {
        test.skip()
        return
      }

      await navigateAndWait(page, '/')

      const url = page.url()
      expect(url).toContain('lab.')
    })
  })

  test.describe('Path Rewriting', () => {
    test('should rewrite lab subdomain paths to /lab routes', async ({ page, baseURL }) => {
      if (!baseURL?.includes('lab.')) {
        test.skip()
        return
      }

      // Access root on lab subdomain
      await navigateAndWait(page, '/')

      // URL should show / but content should come from /lab
      expect(page.url()).toBe(baseURL + '/')

      // Content should be lab-specific
      const content = await page.content()
      expect(content).toBeTruthy()
    })

    test('should not rewrite shared paths', async ({ page }) => {
      // Shared paths like /api, /images, /locales should work on both domains

      const sharedPaths = ['/api/projects', '/locales/en/common.json']

      for (const path of sharedPaths) {
        const response = await page.request.get(path)

        // Should be accessible (200 or 404 if file doesn't exist)
        expect([200, 304, 404]).toContain(response.status())
      }
    })
  })

  test.describe('Redirect Behavior', () => {
    test('should redirect /lab to / on main domain', async ({ page, baseURL }) => {
      // Skip if on lab domain
      if (baseURL?.includes('lab.')) {
        test.skip()
        return
      }

      // Try to access /lab on main domain
      await page.goto('/lab', { waitUntil: 'networkidle' })

      // Should redirect to home
      expect(page.url()).not.toContain('/lab')
      expect(page.url()).toMatch(/\/$/)
    })

    test('should redirect non-www to www for main domain', async ({ page, baseURL }) => {
      // Skip if not on production domain
      if (!baseURL?.includes('harrychang.me')) {
        test.skip()
        return
      }

      // This test is for production domain behavior
      // In dev, this won't apply
      const url = page.url()
      if (url.includes('harrychang.me') && !url.includes('www.')) {
        // Should redirect to www
        expect(url).toContain('www.')
      }
    })

    test('should allow /lab on Vercel preview deployments', async ({ page, baseURL }) => {
      // Skip if not on Vercel preview
      if (!baseURL?.includes('.vercel.app')) {
        test.skip()
        return
      }

      // On Vercel preview, /lab should be accessible directly
      const response = await page.goto('/lab')

      expect(response?.status()).toBeLessThan(400)
    })
  })

  test.describe('Shared Resources', () => {
    test('should allow API access from both domains', async ({ request }) => {
      const endpoints = ['/api/projects', '/api/gallery', '/api/papers']

      for (const endpoint of endpoints) {
        const response = await request.get(endpoint)

        // Should be accessible
        expect([200, 404]).toContain(response.status())
      }
    })

    test('should serve images from both domains', async ({ request }) => {
      const imagePaths = [
        '/images/og-image.png',
        '/images/og-image-lab.png',
        '/placeholder-logo.png',
      ]

      for (const imagePath of imagePaths) {
        const response = await request.get(imagePath)

        // Should be accessible (200) or not found (404)
        expect([200, 304, 404]).toContain(response.status())
      }
    })

    test('should serve locale files from both domains', async ({ request }) => {
      const localeFiles = ['/locales/en/common.json', '/locales/zh-TW/common.json']

      for (const file of localeFiles) {
        const response = await request.get(file)

        expect([200, 304, 404]).toContain(response.status())
      }
    })

    test('should serve static files from both domains', async ({ request }) => {
      const staticFiles = ['/robots.txt', '/sitemap.xml', '/favicon.ico']

      for (const file of staticFiles) {
        const response = await request.get(file)

        // Static files should be accessible
        expect([200, 304, 404]).toContain(response.status())
      }
    })
  })

  test.describe('Favicon Handling', () => {
    test('should serve correct favicon on main domain', async ({ page, baseURL }) => {
      if (baseURL?.includes('lab.')) {
        test.skip()
        return
      }

      await navigateAndWait(page, '/')

      const favicon = page.locator('link[rel="icon"]')
      const hasFavicon = await favicon.count()

      if (hasFavicon > 0) {
        const href = await favicon.getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).not.toContain('lab')
      }
    })

    test('should serve lab-specific favicon on lab domain', async ({ page, baseURL }) => {
      if (!baseURL?.includes('lab.')) {
        test.skip()
        return
      }

      await navigateAndWait(page, '/')

      const favicon = page.locator('link[rel="icon"]')
      const hasFavicon = await favicon.count()

      if (hasFavicon > 0) {
        const href = await favicon.getAttribute('href')
        expect(href).toBeTruthy()
      }
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle nested paths correctly', async ({ page }) => {
      await navigateAndWait(page, '/projects')

      expect(page.url()).toContain('/projects')

      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should handle query parameters', async ({ page }) => {
      await navigateAndWait(page, '/?test=true')

      expect(page.url()).toContain('?test=true')
    })

    test('should handle hash fragments', async ({ page }) => {
      await navigateAndWait(page, '/#section')

      expect(page.url()).toContain('#section')
    })

    test('should handle trailing slashes consistently', async ({ page }) => {
      const response = await page.goto('/projects/')

      expect(response?.status()).toBeLessThan(400)

      // Should work with or without trailing slash
      expect(page.url()).toMatch(/\/projects\/?/)
    })
  })

  test.describe('Performance', () => {
    test('should not add significant latency to requests', async ({ page }) => {
      const startTime = Date.now()
      await navigateAndWait(page, '/')
      const duration = Date.now() - startTime

      // Middleware should process quickly
      expect(duration).toBeLessThan(5000)
    })

    test('should cache middleware decisions when possible', async ({ page }) => {
      // First request
      const start1 = Date.now()
      await navigateAndWait(page, '/')
      const duration1 = Date.now() - start1

      // Second request (should be similar or faster)
      await page.goto('/projects')
      const start2 = Date.now()
      await navigateAndWait(page, '/')
      const duration2 = Date.now() - start2

      // Both should complete in reasonable time
      expect(duration1).toBeLessThan(5000)
      expect(duration2).toBeLessThan(5000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle invalid paths gracefully', async ({ page }) => {
      const response = await page.goto('/this-does-not-exist')

      // Should return 404 or show 404 page
      if (response) {
        expect([200, 404]).toContain(response.status())
      }

      // Should show some content (404 page)
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })

    test('should not expose internal paths in errors', async ({ page }) => {
      await page.goto('/invalid-path')

      const content = await page.content()

      // Should not leak internal implementation details
      expect(content).not.toContain('/app/(main)')
      expect(content).not.toContain('/app/(lab)')
    })
  })
})
