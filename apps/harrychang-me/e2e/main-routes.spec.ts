import { test, expect } from '@playwright/test'
import {
  navigateAndWait,
  waitForPageLoad,
  checkAccessibility,
  checkMetaTags,
  testResponsive,
} from './utils/test-helpers'
import { TEST_ROUTES, EXPECTED_META_TAGS } from './fixtures/test-data'

test.describe('Main Domain Routes', () => {
  test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Check that main content is visible
      const main = page.locator('main')
      await expect(main).toBeVisible()

      // Check basic accessibility
      await checkAccessibility(page)
    })

    test('should have correct meta tags', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)
      await checkMetaTags(page, EXPECTED_META_TAGS.home)
    })

    test('should render header and footer', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const header = page.locator('header')
      const footer = page.locator('footer')

      await expect(header).toBeVisible()
      await expect(footer).toBeVisible()
    })

    test('should be responsive', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      await testResponsive(page, async (viewport) => {
        const main = page.locator('main')
        await expect(main).toBeVisible()
      })
    })

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Allow some Next.js specific warnings
      const criticalErrors = errors.filter(
        (err) => !err.includes('DevTools') && !err.includes('Download the React')
      )
      expect(criticalErrors).toHaveLength(0)
    })
  })

  test.describe('Projects Page', () => {
    test('should load projects page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      await expect(page).toHaveURL(/\/projects/)
      await checkAccessibility(page)
    })

    test('should display project cards', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      // Wait for content to load
      const main = page.locator('main')
      await expect(main).toBeVisible()

      // Projects should either show cards or a message if empty
      const hasProjects = await page.locator('article, [data-testid="project-card"]').count()
      if (hasProjects > 0) {
        const firstCard = page.locator('article, [data-testid="project-card"]').first()
        await expect(firstCard).toBeVisible()
      }
    })

    test('should navigate to project detail page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const projectLink = page.locator('a[href^="/projects/"]').first()
      const linkCount = await projectLink.count()

      if (linkCount > 0) {
        await projectLink.click()
        await waitForPageLoad(page)

        // Should be on a project detail page
        expect(page.url()).toMatch(/\/projects\/.+/)
      }
    })

    test('should filter projects by category if filter exists', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      // Check if category filters exist
      const filterButtons = page.locator('button:has-text("Design"), button:has-text("Development")')
      const hasFilters = await filterButtons.count()

      if (hasFilters > 0) {
        const firstFilter = filterButtons.first()
        await firstFilter.click()
        await page.waitForTimeout(500) // Wait for filter animation

        // Projects should still be visible or show "no results"
        const main = page.locator('main')
        await expect(main).toBeVisible()
      }
    })
  })

  test.describe('Gallery Page', () => {
    test('should load gallery page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      await expect(page).toHaveURL(/\/gallery/)
      await checkAccessibility(page)
    })

    test('should display gallery items', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const main = page.locator('main')
      await expect(main).toBeVisible()

      // Gallery should either show items or a message if empty
      const hasItems = await page.locator('article, [data-testid="gallery-card"]').count()
      if (hasItems > 0) {
        const firstItem = page.locator('article, [data-testid="gallery-card"]').first()
        await expect(firstItem).toBeVisible()
      }
    })

    test('should navigate to gallery detail page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const galleryLink = page.locator('a[href^="/gallery/"]').first()
      const linkCount = await galleryLink.count()

      if (linkCount > 0) {
        await galleryLink.click()
        await waitForPageLoad(page)

        expect(page.url()).toMatch(/\/gallery\/.+/)
      }
    })

    test('should load optimized images', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const images = page.locator('img').first()
      const imageCount = await images.count()

      if (imageCount > 0) {
        await expect(images).toBeVisible()
        const src = await images.getAttribute('src')
        expect(src).toBeTruthy()

        // Should use optimized images (WebP or Next.js Image optimization)
        const isOptimized =
          src?.includes('.webp') ||
          src?.includes('/_next/image') ||
          src?.includes('/optimized/')
        expect(isOptimized).toBeTruthy()
      }
    })
  })

  test.describe('Static Pages', () => {
    test('should load CV page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.cv)

      await expect(page).toHaveURL(/\/cv/)
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should load Uses page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.uses)

      await expect(page).toHaveURL(/\/uses/)
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should load Manifesto page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.manifesto)

      await expect(page).toHaveURL(/\/manifesto/)
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should load Paper Reading page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.paperReading)

      await expect(page).toHaveURL(/\/paper-reading/)
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should load Design page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.design)

      await expect(page).toHaveURL(/\/design/)
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between pages using header links', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Find and click Projects link
      const projectsLink = page.locator('a[href="/projects"]').first()
      if (await projectsLink.count() > 0) {
        await projectsLink.click()
        await waitForPageLoad(page)
        await expect(page).toHaveURL(/\/projects/)
      }

      // Navigate to Gallery
      const galleryLink = page.locator('a[href="/gallery"]').first()
      if (await galleryLink.count() > 0) {
        await galleryLink.click()
        await waitForPageLoad(page)
        await expect(page).toHaveURL(/\/gallery/)
      }
    })

    test('should have working logo link to homepage', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const logoLink = page.locator('header a[href="/"]').first()
      if (await logoLink.count() > 0) {
        await logoLink.click()
        await waitForPageLoad(page)
        await expect(page).toHaveURL(/^\/$/)
      }
    })
  })

  test.describe('404 Page', () => {
    test('should show 404 page for non-existent routes', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist')

      // Should return 404 status or show 404 content
      if (response) {
        const status = response.status()
        expect([404, 200]).toContain(status) // Next.js might return 200 with 404 page
      }

      // Check for 404 content
      const content = await page.content()
      const has404Content =
        content.includes('404') ||
        content.includes('not found') ||
        content.includes('Not Found')

      expect(has404Content).toBeTruthy()
    })
  })

  test.describe('Performance', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await navigateAndWait(page, TEST_ROUTES.main.home)
      const loadTime = Date.now() - startTime

      // Page should load within 5 seconds (generous for CI)
      expect(loadTime).toBeLessThan(5000)
    })

    test('should not block rendering with large images', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      // Check that content is visible even if images are loading
      const main = page.locator('main')
      await expect(main).toBeVisible()

      // Images should have loading strategy
      const images = page.locator('img')
      const firstImage = images.first()
      if (await firstImage.count() > 0) {
        const loading = await firstImage.getAttribute('loading')
        // Should use lazy loading or eager loading, but be intentional
        expect(loading).toBeTruthy()
      }
    })
  })
})
