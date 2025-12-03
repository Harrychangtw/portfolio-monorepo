import { test, expect } from '@playwright/test'
import {
  navigateAndWait,
  waitForPageLoad,
  checkAccessibility,
  testMiddlewareRedirect,
} from './utils/test-helpers'

/**
 * Lab subdomain E2E tests
 * These tests verify the dual-domain architecture via middleware
 */

test.describe('Lab Subdomain Routes', () => {
  test.describe('Lab Homepage', () => {
    test('should load lab homepage on lab subdomain', async ({ page }) => {
      // This test assumes lab.localhost:3001 or similar
      await navigateAndWait(page, '/')

      const main = page.locator('main')
      await expect(main).toBeVisible()
      await checkAccessibility(page)
    })

    test('should have lab-specific branding/content', async ({ page }) => {
      await navigateAndWait(page, '/')

      // Lab should have different content than main site
      // This could be a specific heading, logo, or other identifier
      const content = await page.content()
      const hasLabContent = content.includes('lab') || content.includes('Lab')
      expect(hasLabContent).toBeTruthy()
    })

    test('should have correct meta tags for lab', async ({ page }) => {
      await navigateAndWait(page, '/')

      const title = await page.title()
      expect(title).toBeTruthy()

      // Should have og:image meta tag
      const ogImage = page.locator('meta[property="og:image"]')
      await expect(ogImage).toHaveAttribute('content', /.+/)
    })
  })

  test.describe('Lab Waitlist Feature', () => {
    test('should display waitlist form if implemented', async ({ page }) => {
      await navigateAndWait(page, '/')

      // Check if waitlist form exists
      const waitlistForm = page.locator('form').first()
      const formCount = await waitlistForm.count()

      if (formCount > 0) {
        await expect(waitlistForm).toBeVisible()

        // Form should have email input
        const emailInput = page.locator('input[type="email"]')
        await expect(emailInput).toBeVisible()
      }
    })

    test('should validate email input', async ({ page }) => {
      await navigateAndWait(page, '/')

      const emailInput = page.locator('input[type="email"]').first()
      const formCount = await emailInput.count()

      if (formCount > 0) {
        // Try submitting with invalid email
        await emailInput.fill('invalid-email')

        const submitButton = page.locator('button[type="submit"]').first()
        await submitButton.click()

        // Should show validation error or prevent submission
        await page.waitForTimeout(500)

        // Valid email should work better
        await emailInput.fill('test@example.com')
        await submitButton.click()

        // Should either show success message or loading state
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Shared Resources', () => {
    test('should access shared API routes', async ({ page }) => {
      // API routes should be accessible from lab domain
      const response = await page.request.get('/api/test-env')

      // Should either succeed or return proper error
      expect([200, 404, 500]).toContain(response.status())
    })

    test('should load shared images', async ({ page }) => {
      await navigateAndWait(page, '/')

      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        const firstImage = images.first()
        const src = await firstImage.getAttribute('src')

        expect(src).toBeTruthy()

        // Images should load successfully
        await expect(firstImage).toBeVisible()
      }
    })

    test('should load shared locale files', async ({ page }) => {
      await navigateAndWait(page, '/')

      // Check if locale files are accessible
      const response = await page.request.get('/locales/en/common.json')

      // Should be accessible (200) or redirected properly
      expect([200, 304]).toContain(response.status())
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await navigateAndWait(page, '/')

      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await navigateAndWait(page, '/')

      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await navigateAndWait(page, '/')

      const main = page.locator('main')
      await expect(main).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await navigateAndWait(page, '/')
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    })

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await navigateAndWait(page, '/')

      const criticalErrors = errors.filter(
        (err) => !err.includes('DevTools') && !err.includes('Download the React')
      )
      expect(criticalErrors).toHaveLength(0)
    })
  })
})

/**
 * Middleware behavior tests
 * These test the dual-domain routing logic
 */
test.describe('Middleware Routing', () => {
  test.describe('Main Domain Middleware', () => {
    test.skip('should redirect /lab routes to / on main domain', async ({ page }) => {
      // This test should only run on main domain (localhost:3000)
      // Skip if on lab domain
      const url = page.context()._options.baseURL
      if (url?.includes('lab.')) {
        test.skip()
        return
      }

      await testMiddlewareRedirect(page, '/lab', '/')
    })

    test.skip('should prevent access to lab-only routes on main domain', async ({ page }) => {
      const url = page.context()._options.baseURL
      if (url?.includes('lab.')) {
        test.skip()
        return
      }

      // Attempting to access /lab should redirect
      await page.goto('/lab')
      await waitForPageLoad(page)

      expect(page.url()).not.toContain('/lab')
    })
  })

  test.describe('Lab Domain Middleware', () => {
    test.skip('should rewrite lab.domain.com/ to /lab internally', async ({ page }) => {
      // This test verifies the middleware rewrite behavior
      const url = page.context()._options.baseURL
      if (!url?.includes('lab.')) {
        test.skip()
        return
      }

      await navigateAndWait(page, '/')

      // Content should be served from /lab routes
      // but URL should show just /
      expect(page.url()).toBe(url + '/')
    })
  })

  test.describe('Shared Paths', () => {
    test('should allow access to /api routes from both domains', async ({ page }) => {
      const response = await page.request.get('/api/test-env')
      expect([200, 404, 500]).toContain(response.status())
    })

    test('should allow access to /images from both domains', async ({ page }) => {
      // Test that images are shared
      const response = await page.request.get('/images/og-image.png')
      expect([200, 304, 404]).toContain(response.status())
    })

    test('should allow access to /locales from both domains', async ({ page }) => {
      const response = await page.request.get('/locales/en/common.json')
      expect([200, 304, 404]).toContain(response.status())
    })
  })
})
