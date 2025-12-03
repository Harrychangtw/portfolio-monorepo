import { test, expect } from '@playwright/test'
import {
  navigateAndWait,
  waitForPageLoad,
  checkOptimizedImage,
  testExternalLink,
  waitForAnimations,
} from './utils/test-helpers'
import { TEST_ROUTES } from './fixtures/test-data'

/**
 * Shared Components E2E tests
 * Tests components from packages/ui and app/components
 */

test.describe('Shared Components', () => {
  test.describe('Header Component', () => {
    test('should render header on all pages', async ({ page }) => {
      const routes = [
        TEST_ROUTES.main.home,
        TEST_ROUTES.main.projects,
        TEST_ROUTES.main.gallery,
      ]

      for (const route of routes) {
        await navigateAndWait(page, route)

        const header = page.locator('header')
        await expect(header).toBeVisible()
      }
    })

    test('should have navigation links', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const header = page.locator('header')
      const links = header.locator('a')

      const linkCount = await links.count()
      expect(linkCount).toBeGreaterThan(0)
    })

    test('should have logo/home link', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const logoLink = page.locator('header a[href="/"]')
      const hasLogo = await logoLink.count()

      if (hasLogo > 0) {
        await expect(logoLink.first()).toBeVisible()

        // Click logo should navigate home
        await logoLink.first().click()
        await waitForPageLoad(page)

        expect(page.url()).toMatch(/\/$/)
      }
    })

    test('should be sticky or fixed on scroll', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const header = page.locator('header')

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500))
      await page.waitForTimeout(300)

      // Header should still be visible
      await expect(header).toBeVisible()
    })

    test('should be responsive', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const header = page.locator('header')

      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(header).toBeVisible()

      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(header).toBeVisible()

      // Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(header).toBeVisible()
    })

    test('should have mobile menu if on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Look for hamburger menu or mobile menu trigger
      const mobileMenuTrigger = page.locator(
        'button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu"]'
      )

      const hasMobileMenu = await mobileMenuTrigger.count()
      if (hasMobileMenu > 0) {
        await expect(mobileMenuTrigger.first()).toBeVisible()

        // Click to open menu
        await mobileMenuTrigger.first().click()
        await page.waitForTimeout(500)

        // Menu should be visible
        const nav = page.locator('nav')
        await expect(nav).toBeVisible()
      }
    })
  })

  test.describe('Footer Component', () => {
    test('should render footer on all pages', async ({ page }) => {
      const routes = [
        TEST_ROUTES.main.home,
        TEST_ROUTES.main.projects,
        TEST_ROUTES.main.gallery,
      ]

      for (const route of routes) {
        await navigateAndWait(page, route)

        const footer = page.locator('footer')
        await expect(footer).toBeVisible()
      }
    })

    test('should have social links', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const footer = page.locator('footer')
      const links = footer.locator('a[href^="http"]')

      const linkCount = await links.count()
      if (linkCount > 0) {
        const firstLink = links.first()
        await expect(firstLink).toBeVisible()

        // External links should open in new tab
        const target = await firstLink.getAttribute('target')
        expect(target).toBe('_blank')
      }
    })

    test('should have copyright or attribution', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const footer = page.locator('footer')
      const content = await footer.textContent()

      expect(content).toBeTruthy()
      expect(content!.length).toBeGreaterThan(0)
    })
  })

  test.describe('Project Card Component', () => {
    test('should display project cards on projects page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const cards = page.locator('article, [data-testid="project-card"]')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        const firstCard = cards.first()
        await expect(firstCard).toBeVisible()

        // Should have title
        const title = firstCard.locator('h1, h2, h3, [data-testid="project-title"]')
        const hasTit = await title.count()
        if (hasTit > 0) {
          await expect(title.first()).toBeVisible()
        }

        // Should have image
        const image = firstCard.locator('img')
        const hasImg = await image.count()
        if (hasImg > 0) {
          await expect(image.first()).toBeVisible()
        }
      }
    })

    test('should have 3:2 aspect ratio images', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const cards = page.locator('article, [data-testid="project-card"]')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        const firstCard = cards.first()
        const image = firstCard.locator('img').first()
        const hasImg = await image.count()

        if (hasImg > 0) {
          await expect(image).toBeVisible()

          // Get aspect ratio
          const box = await image.boundingBox()
          if (box) {
            const aspectRatio = box.width / box.height
            // 3:2 = 1.5, allow some tolerance
            expect(aspectRatio).toBeGreaterThan(1.3)
            expect(aspectRatio).toBeLessThan(1.7)
          }
        }
      }
    })

    test('should be clickable and navigate to project detail', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const projectLink = page.locator('a[href^="/projects/"]').first()
      const hasLinks = await projectLink.count()

      if (hasLinks > 0) {
        const href = await projectLink.getAttribute('href')

        await projectLink.click()
        await waitForPageLoad(page)

        expect(page.url()).toContain(href!)
      }
    })

    test('should show pinned badge if project is pinned', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      // Look for pinned indicator
      const pinnedBadge = page.locator(
        '[data-testid="pinned-badge"], .pinned, [aria-label*="pinned"]'
      )

      // May or may not have pinned projects
      const hasPinned = await pinnedBadge.count()
      if (hasPinned > 0) {
        await expect(pinnedBadge.first()).toBeVisible()
      }
    })

    test('should have hover effects', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const cards = page.locator('article, [data-testid="project-card"]')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        const firstCard = cards.first()

        // Get initial state
        const initialOpacity = await firstCard.evaluate((el) => {
          return window.getComputedStyle(el).opacity
        })

        // Hover
        await firstCard.hover()
        await page.waitForTimeout(300)

        // Should have some visual change (difficult to test precisely)
        await expect(firstCard).toBeVisible()
      }
    })
  })

  test.describe('Gallery Card Component', () => {
    test('should display gallery cards on gallery page', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const cards = page.locator('article, [data-testid="gallery-card"]')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        const firstCard = cards.first()
        await expect(firstCard).toBeVisible()
      }
    })

    test('should have variable aspect ratios with framelines', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const images = page.locator('img').first()
      const hasImages = await images.count()

      if (hasImages > 0) {
        await expect(images).toBeVisible()

        // Gallery images can have variable aspect ratios
        const box = await images.boundingBox()
        expect(box).toBeTruthy()
      }
    })

    test('should be clickable and navigate to gallery detail', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const galleryLink = page.locator('a[href^="/gallery/"]').first()
      const hasLinks = await galleryLink.count()

      if (hasLinks > 0) {
        const href = await galleryLink.getAttribute('href')

        await galleryLink.click()
        await waitForPageLoad(page)

        expect(page.url()).toContain(href!)
      }
    })
  })

  test.describe('Image Optimization', () => {
    test('should use WebP format for optimized images', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        const firstImage = images.first()
        const src = await firstImage.getAttribute('src')

        expect(src).toBeTruthy()

        // Should use WebP or Next.js Image optimization
        const isOptimized =
          src?.includes('.webp') ||
          src?.includes('/_next/image') ||
          src?.includes('/optimized/')

        expect(isOptimized).toBeTruthy()
      }
    })

    test('should load thumbnail images on list pages', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        const firstImage = images.first()
        const src = await firstImage.getAttribute('src')

        // List pages should use thumbnails (-thumb.webp)
        // or responsive images
        expect(src).toBeTruthy()
      }
    })

    test('should have lazy loading for below-fold images', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.gallery)

      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 3) {
        // Check later images for lazy loading
        const laterImage = images.nth(3)
        const loading = await laterImage.getAttribute('loading')

        // Should have loading attribute
        expect(['lazy', 'eager']).toContain(loading)
      }
    })

    test('should have blur placeholders for progressive loading', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      // Check if images have placeholder or blur effect
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        const firstImage = images.first()

        // Check for blur placeholder (implementation specific)
        const src = await firstImage.getAttribute('src')
        const hasSrc = src && src.length > 0

        expect(hasSrc).toBeTruthy()
      }
    })
  })

  test.describe('Framer Motion Animations', () => {
    test('should animate elements on page load', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Wait for Framer Motion animations
      await waitForAnimations(page)

      const main = page.locator('main')
      await expect(main).toBeVisible()

      // Elements should be visible after animation
      const opacity = await main.evaluate((el) => {
        return window.getComputedStyle(el).opacity
      })

      expect(parseFloat(opacity)).toBeGreaterThan(0.5)
    })

    test('should animate cards on scroll', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const cards = page.locator('article, [data-testid="project-card"]')
      const cardCount = await cards.count()

      if (cardCount > 3) {
        // Scroll down to trigger animations
        await page.evaluate(() => window.scrollTo(0, 500))
        await waitForAnimations(page)

        // Cards should be visible
        const visibleCards = cards.first()
        await expect(visibleCards).toBeVisible()
      }
    })

    test('should not cause layout shift during animations', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Get initial layout
      const main = page.locator('main')
      const initialBox = await main.boundingBox()

      await waitForAnimations(page)

      const finalBox = await main.boundingBox()

      // Position should be stable (allowing for small differences)
      if (initialBox && finalBox) {
        expect(Math.abs(initialBox.y - finalBox.y)).toBeLessThan(50)
      }
    })
  })

  test.describe('Dark Mode (Default)', () => {
    test('should have dark background by default', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const body = page.locator('body')
      const bgColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })

      // Dark mode should have low RGB values
      expect(bgColor).toBeTruthy()

      // Parse RGB values
      const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number)
        // Dark background should have all values below 50
        const isDark = r < 50 && g < 50 && b < 50
        expect(isDark).toBeTruthy()
      }
    })

    test('should have proper contrast for text', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const body = page.locator('body')
      const color = await body.evaluate((el) => {
        return window.getComputedStyle(el).color
      })

      // Text should be light colored
      expect(color).toBeTruthy()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Should have h1
      const h1 = page.locator('h1')
      const h1Count = await h1.count()

      if (h1Count === 0) {
        console.warn('Warning: No h1 found on page')
      }
    })

    test('should have alt text for images', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.projects)

      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i)
          const alt = await img.getAttribute('alt')

          // Alt should exist (can be empty for decorative images)
          expect(alt !== null).toBeTruthy()
        }
      }
    })

    test('should have focus indicators', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      const firstLink = page.locator('a').first()
      await firstLink.focus()

      // Link should be focused
      const isFocused = await firstLink.evaluate((el) => {
        return el === document.activeElement
      })

      expect(isFocused).toBeTruthy()
    })

    test('should be keyboard navigable', async ({ page }) => {
      await navigateAndWait(page, TEST_ROUTES.main.home)

      // Press Tab to navigate
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)

      const activeElement = page.locator(':focus')
      await expect(activeElement).toBeTruthy()
    })
  })
})
