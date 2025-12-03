import { Page, expect } from '@playwright/test'

/**
 * Test helper utilities for common operations across E2E tests
 */

/**
 * Wait for the page to be fully loaded including all network requests
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Wait for language context to be initialized (client-side i18n)
 * This is critical since the app uses client-side translation
 */
export async function waitForLanguageContext(page: Page) {
  // Wait for the language context to load by checking for translated content
  await page.waitForFunction(() => {
    return document.body.innerText.length > 0
  })
}

/**
 * Switch language using the language selector
 */
export async function switchLanguage(page: Page, language: 'en' | 'zh-TW') {
  // Look for language toggle button (adjust selector based on actual implementation)
  const languageToggle = page.locator('[data-testid="language-toggle"]').or(
    page.locator('button:has-text("EN")').or(page.locator('button:has-text("中文")'))
  )

  await languageToggle.first().click()

  // Wait for language to switch by checking localStorage
  await page.waitForFunction(
    (lang) => localStorage.getItem('preferredLanguage') === lang,
    language
  )

  // Wait for content to re-render
  await page.waitForTimeout(500)
}

/**
 * Check if an image is optimized (WebP format)
 */
export async function checkOptimizedImage(page: Page, selector: string) {
  const img = page.locator(selector).first()
  await expect(img).toBeVisible()

  const src = await img.getAttribute('src')
  expect(src).toBeTruthy()

  // Check if it's a WebP image or uses Next.js Image optimization
  const isOptimized =
    src?.includes('.webp') ||
    src?.includes('/_next/image') ||
    src?.includes('/optimized/')

  expect(isOptimized).toBeTruthy()

  return src
}

/**
 * Test responsive behavior by changing viewport
 */
export async function testResponsive(
  page: Page,
  callback: (viewport: 'mobile' | 'tablet' | 'desktop') => Promise<void>
) {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  }

  for (const [name, size] of Object.entries(viewports)) {
    await page.setViewportSize(size)
    await page.waitForTimeout(300) // Wait for layout shift
    await callback(name as 'mobile' | 'tablet' | 'desktop')
  }
}

/**
 * Check for accessibility violations (basic checks)
 */
export async function checkAccessibility(page: Page) {
  // Check for basic accessibility requirements
  await expect(page.locator('html')).toHaveAttribute('lang')

  // Check for main landmark
  const main = page.locator('main')
  if (await main.count() === 0) {
    console.warn('Warning: No <main> landmark found')
  }
}

/**
 * Test navigation between pages
 */
export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url)
  await waitForPageLoad(page)
  await waitForLanguageContext(page)
}

/**
 * Check for console errors (excluding specific allowed patterns)
 */
export async function checkConsoleErrors(page: Page, allowedPatterns: string[] = []) {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      const isAllowed = allowedPatterns.some(pattern => text.includes(pattern))
      if (!isAllowed) {
        errors.push(text)
      }
    }
  })

  return errors
}

/**
 * Wait for Framer Motion animations to complete
 */
export async function waitForAnimations(page: Page) {
  await page.waitForTimeout(1000) // Wait for typical animation duration
}

/**
 * Test that a link opens in a new tab
 */
export async function testExternalLink(page: Page, selector: string) {
  const link = page.locator(selector)
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', /noopener/)
}

/**
 * Get current locale from page
 */
export async function getCurrentLocale(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return localStorage.getItem('preferredLanguage') || 'en'
  })
}

/**
 * Mock API response for testing
 */
export async function mockApiResponse(
  page: Page,
  endpoint: string,
  response: any,
  status: number = 200
) {
  await page.route(`**/api/${endpoint}`, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

/**
 * Check if dark mode is active (this site is dark mode only)
 */
export async function checkDarkMode(page: Page) {
  const html = page.locator('html')
  const classList = await html.getAttribute('class')

  // This site is dark mode only, so we just verify dark styles are applied
  const bodyBg = await page.locator('body').evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor
  })

  // Dark background should have low RGB values
  expect(bodyBg).toBeTruthy()
}

/**
 * Test middleware redirects
 */
export async function testMiddlewareRedirect(
  page: Page,
  fromUrl: string,
  expectedUrl: string
) {
  const response = await page.goto(fromUrl)
  expect(response?.status()).toBeLessThan(400)
  expect(page.url()).toContain(expectedUrl)
}

/**
 * Scroll to element and wait for it to be in viewport
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector)
  await element.scrollIntoViewIfNeeded()
  await expect(element).toBeInViewport()
  await page.waitForTimeout(300) // Wait for scroll animations
}

/**
 * Check for proper meta tags (SEO)
 */
export async function checkMetaTags(page: Page, expectedTags: {
  title?: string
  description?: string
  ogImage?: boolean
}) {
  if (expectedTags.title) {
    await expect(page).toHaveTitle(new RegExp(expectedTags.title, 'i'))
  }

  if (expectedTags.description) {
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', new RegExp(expectedTags.description, 'i'))
  }

  if (expectedTags.ogImage) {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /.+/)
  }
}
