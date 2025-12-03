# E2E Test Suite

Comprehensive end-to-end testing suite for the Harry Chang Portfolio using Playwright.

## Overview

This test suite covers:

- **Main Domain Routes** - All pages on the main site (harrychang.me)
- **Lab Subdomain Routes** - Lab-specific features (lab.harrychang.me)
- **i18n Functionality** - Client-side translation system
- **API Routes** - All backend endpoints
- **Middleware** - Dual-domain routing logic
- **Shared Components** - UI components from packages/ui
- **Performance** - Load times, optimization checks
- **Accessibility** - Basic a11y compliance

## Quick Start

### Installation

Playwright is already installed if you ran `pnpm install`. If not:

```bash
pnpm install
pnpx playwright install
```

### Running Tests

```bash
# Run all tests (headless)
pnpm test:e2e

# Run tests with UI mode (recommended for development)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e:debug

# Run only main domain tests
pnpm test:e2e:main

# Run only lab domain tests
pnpm test:e2e:lab

# Generate tests using codegen
pnpm test:e2e:codegen

# View test report
pnpm test:e2e:report
```

### Running Specific Test Files

```bash
# Run single test file
pnpx playwright test e2e/main-routes.spec.ts

# Run specific test by name
pnpx playwright test -g "should load homepage successfully"

# Run tests in specific browser
pnpx playwright test --project=chromium
pnpx playwright test --project=firefox
pnpx playwright test --project=webkit
```

## Test Structure

```
e2e/
├── main-routes.spec.ts      # Main domain page tests
├── lab-routes.spec.ts        # Lab subdomain tests
├── i18n.spec.ts              # Translation system tests
├── api-routes.spec.ts        # API endpoint tests
├── middleware.spec.ts        # Routing logic tests
├── components.spec.ts        # UI component tests
├── utils/
│   └── test-helpers.ts       # Shared test utilities
└── fixtures/
    └── test-data.ts          # Test data and mocks
```

## Test Categories

### Main Routes Tests
Tests all public pages on the main domain:
- Homepage
- Projects page and detail pages
- Gallery page and detail pages
- Static pages (CV, Uses, Manifesto, etc.)
- Navigation and routing
- 404 handling

### Lab Routes Tests
Tests the lab subdomain features:
- Lab homepage
- Waitlist functionality
- Lab-specific branding
- Shared resource access

### i18n Tests
Tests the client-side translation system:
- Language detection and switching
- Translation file loading
- Locale persistence
- Content localization
- File-based markdown localization
- FOUC prevention

### API Tests
Tests all API endpoints:
- `/api/projects` - Project metadata and content
- `/api/gallery` - Gallery metadata and content
- `/api/papers` - arXiv paper fetching
- `/api/spotify/now-playing` - Spotify integration
- `/api/lab/waitlist` - Waitlist submissions
- Locale parameter handling
- Error handling and validation

### Middleware Tests
Tests the dual-domain routing:
- Subdomain detection
- Path rewriting for lab domain
- Redirect behavior
- Shared resource access
- Edge cases and error handling

### Component Tests
Tests UI components:
- Header and navigation
- Footer and social links
- Project and gallery cards
- Image optimization
- Framer Motion animations
- Dark mode (default)
- Accessibility features

## Configuration

### Playwright Config
See `playwright.config.ts` for full configuration.

Key settings:
- **Base URL**: `http://localhost:3000` (main) and `http://localhost:3001` (lab)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML and GitHub (on CI)
- **Web Server**: Auto-starts dev servers before tests

### Environment Variables

Tests use environment variables for API keys and database URLs. Create `.env.local`:

```bash
# Database (required for tests)
DATABASE_URL="postgresql://..."
POSTGRES_URL="postgresql://..."

# Optional API keys (tests will skip if not present)
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
SPOTIFY_REFRESH_TOKEN="..."

RESEND_API_KEY="..."
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

See `.github/workflows/playwright.yml` for CI configuration.

### Sharding
Tests are split into 4 parallel shards for faster CI runs:
```bash
pnpx playwright test --shard=1/4
pnpx playwright test --shard=2/4
# etc.
```

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test'
import { navigateAndWait } from './utils/test-helpers'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await navigateAndWait(page, '/path')

    const element = page.locator('selector')
    await expect(element).toBeVisible()
  })
})
```

### Using Test Helpers

The `utils/test-helpers.ts` file provides reusable functions:

```typescript
// Navigate and wait for page load + i18n
await navigateAndWait(page, '/projects')

// Switch language
await switchLanguage(page, 'zh-TW')

// Check optimized images
await checkOptimizedImage(page, 'img.first')

// Test responsive behavior
await testResponsive(page, async (viewport) => {
  // Your assertions here
})

// Check accessibility
await checkAccessibility(page)

// Mock API responses
await mockApiResponse(page, 'projects', mockData)
```

### Test Data Fixtures

Use `fixtures/test-data.ts` for shared test data:

```typescript
import { TEST_ROUTES, MOCK_API_RESPONSES } from './fixtures/test-data'

// Use predefined routes
await page.goto(TEST_ROUTES.main.projects)

// Use mock data
await mockApiResponse(page, 'projects', MOCK_API_RESPONSES.projects)
```

## Best Practices

### 1. Use Proper Selectors
```typescript
// ✅ Good - use data-testid
page.locator('[data-testid="project-card"]')

// ✅ Good - use semantic selectors
page.locator('main')
page.locator('article')

// ❌ Avoid - brittle class selectors
page.locator('.css-class-12345')
```

### 2. Wait for Elements
```typescript
// ✅ Good - wait for element
const element = page.locator('selector')
await expect(element).toBeVisible()

// ❌ Avoid - assuming element exists
const element = page.locator('selector')
await element.click() // May fail
```

### 3. Handle Optional Elements
```typescript
// ✅ Good - check if element exists
const count = await element.count()
if (count > 0) {
  await expect(element.first()).toBeVisible()
}

// ❌ Avoid - assume element exists
await expect(element).toBeVisible() // Fails if not present
```

### 4. Use Test Isolation
```typescript
// ✅ Good - independent tests
test('test 1', async ({ page }) => {
  await page.goto('/path')
  // Test logic
})

test('test 2', async ({ page }) => {
  await page.goto('/path') // Fresh page
  // Test logic
})

// ❌ Avoid - dependent tests
let sharedState
test('test 1', () => { sharedState = 'value' })
test('test 2', () => { expect(sharedState).toBe('value') })
```

### 5. Use Descriptive Test Names
```typescript
// ✅ Good
test('should display project cards with 3:2 aspect ratio')

// ❌ Avoid
test('cards test')
```

## Debugging

### Debug Mode
```bash
# Run specific test in debug mode
pnpx playwright test e2e/main-routes.spec.ts -g "homepage" --debug
```

### UI Mode
```bash
# Interactive test runner
pnpm test:e2e:ui
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots (on failure)
- Videos (retained on failure)
- Traces (on first retry)

View in the HTML report:
```bash
pnpm test:e2e:report
```

### Console Logs
```typescript
// Add console logging in tests
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()))
  await page.goto('/')
})
```

## Common Issues

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Use proper wait strategies
- Check if dev server is running

### Flaky Tests
- Add proper waits for animations
- Use `waitForLoadState('networkidle')`
- Avoid hardcoded timeouts

### Different Results Locally vs CI
- Check environment variables
- Verify Node.js and pnpm versions
- Review CI logs for specific errors

### Lab Domain Tests Failing
- Ensure lab server is running on port 3001
- Check middleware configuration
- Verify lab-specific environment variables

## Coverage

Current test coverage:

- ✅ All main domain routes
- ✅ All API endpoints
- ✅ i18n system (en/zh-TW)
- ✅ Middleware routing
- ✅ Lab subdomain basics
- ✅ Shared components
- ✅ Image optimization
- ✅ Responsive design
- ✅ Basic accessibility

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing Library Guide](https://testing-library.com/docs/queries/about)

## Contributing

When adding new features:
1. Write tests for new routes/components
2. Update test data fixtures if needed
3. Run full test suite before PR
4. Update this README if adding new test categories

## Support

For issues with tests:
1. Check test output and screenshots
2. Run in headed/debug mode
3. Review relevant test file
4. Check GitHub Actions logs for CI failures
