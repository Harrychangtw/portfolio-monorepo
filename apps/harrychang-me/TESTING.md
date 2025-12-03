# Testing Guide

Quick reference for running E2E tests on the Harry Chang Portfolio.

## Setup

### First Time Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Install Playwright browsers**
   ```bash
   pnpx playwright install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.test.example .env.local
   # Edit .env.local with your values
   ```

## Running Tests

### Quick Commands

```bash
# Run all tests (headless)
pnpm test:e2e

# Run with interactive UI (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see the browser)
pnpm test:e2e:headed

# Debug mode with inspector
pnpm test:e2e:debug

# Generate tests interactively
pnpm test:e2e:codegen

# View last test report
pnpm test:e2e:report
```

### Targeted Testing

```bash
# Test only main domain
pnpm test:e2e:main

# Test only lab subdomain
pnpm test:e2e:lab

# Run specific test file
pnpx playwright test e2e/main-routes.spec.ts

# Run tests matching pattern
pnpx playwright test -g "projects"

# Run in specific browser
pnpx playwright test --project=chromium
pnpx playwright test --project=firefox
pnpx playwright test --project=webkit
pnpx playwright test --project="Mobile Chrome"
```

## Test Development Workflow

### 1. Write Tests

Create or edit test files in `e2e/`:
- `main-routes.spec.ts` - Main site pages
- `lab-routes.spec.ts` - Lab subdomain
- `api-routes.spec.ts` - API endpoints
- `i18n.spec.ts` - Translation system
- `components.spec.ts` - UI components
- `middleware.spec.ts` - Routing logic

### 2. Run Tests Locally

```bash
# Start dev servers (in separate terminals)
pnpm dev          # Main site on :3000
pnpm dev:lab      # Lab site on :3001

# Run tests
pnpm test:e2e:ui
```

### 3. Debug Failures

```bash
# Run with UI mode to step through tests
pnpm test:e2e:ui

# Or use debug mode
pnpm test:e2e:debug

# Or run in headed mode to see browser
pnpm test:e2e:headed
```

### 4. View Results

```bash
# Open HTML report
pnpm test:e2e:report
```

## Test Structure

```
e2e/
├── main-routes.spec.ts      # Homepage, projects, gallery, etc.
├── lab-routes.spec.ts        # Lab subdomain features
├── i18n.spec.ts              # Client-side translations
├── api-routes.spec.ts        # API endpoint tests
├── middleware.spec.ts        # Dual-domain routing
├── components.spec.ts        # UI components
├── utils/
│   └── test-helpers.ts       # Reusable test functions
└── fixtures/
    └── test-data.ts          # Mock data and constants
```

## Common Test Patterns

### Navigate and Wait
```typescript
import { navigateAndWait } from './utils/test-helpers'

await navigateAndWait(page, '/projects')
```

### Check Element Visibility
```typescript
const element = page.locator('selector')
await expect(element).toBeVisible()
```

### Test Responsive Design
```typescript
import { testResponsive } from './utils/test-helpers'

await testResponsive(page, async (viewport) => {
  // assertions for each viewport
})
```

### Mock API Responses
```typescript
import { mockApiResponse } from './utils/test-helpers'

await mockApiResponse(page, 'projects', mockData)
```

## CI/CD

Tests run automatically on GitHub Actions:
- On push to `main` or `develop`
- On pull requests

View results in the Actions tab of the GitHub repository.

## Troubleshooting

### Tests timing out

**Problem**: Tests hang or timeout

**Solution**:
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds

# Or use waitForLoadState
await page.waitForLoadState('networkidle')
```

### Flaky tests

**Problem**: Tests pass sometimes, fail other times

**Solution**:
- Add proper waits: `await expect(element).toBeVisible()`
- Avoid hardcoded timeouts: `page.waitForTimeout(1000)`
- Use `waitForLoadState` instead of arbitrary waits

### Dev server not starting

**Problem**: Tests fail because localhost:3000 is not accessible

**Solution**:
```bash
# Start dev servers manually
pnpm dev          # Terminal 1
pnpm dev:lab      # Terminal 2

# Then run tests
pnpm test:e2e
```

### Different results locally vs CI

**Problem**: Tests pass locally but fail on CI

**Solution**:
- Check environment variables in `.github/workflows/playwright.yml`
- Verify Node.js version matches
- Review CI logs for specific errors
- Run tests in headless mode locally: `pnpm test:e2e`

### Lab tests failing

**Problem**: Lab subdomain tests fail

**Solution**:
```bash
# Ensure lab server is running
pnpm dev:lab

# Set correct base URL
export PLAYWRIGHT_LAB_URL=http://lab.localhost:3001

# Run lab tests
pnpm test:e2e:lab
```

## Advanced Usage

### Test Specific Browser
```bash
pnpx playwright test --project=chromium
pnpx playwright test --project=firefox
pnpx playwright test --project=webkit
```

### Parallel Execution
```bash
# Run with max parallelism
pnpx playwright test --workers=4

# Run single-threaded (for debugging)
pnpx playwright test --workers=1
```

### Sharding (for CI)
```bash
# Split tests across multiple machines
pnpx playwright test --shard=1/4
pnpx playwright test --shard=2/4
pnpx playwright test --shard=3/4
pnpx playwright test --shard=4/4
```

### Update Snapshots
```bash
# Update visual snapshots (if using)
pnpx playwright test --update-snapshots
```

### Trace Viewer
```bash
# Record trace
pnpx playwright test --trace on

# View trace
pnpx playwright show-trace trace.zip
```

## Best Practices

1. **Write isolated tests** - Each test should be independent
2. **Use semantic selectors** - Prefer `data-testid` over CSS classes
3. **Wait for elements** - Always use `expect(element).toBeVisible()`
4. **Handle optional elements** - Check count before asserting
5. **Descriptive test names** - Clearly state what is being tested
6. **Use test helpers** - Reuse common patterns from `utils/test-helpers.ts`
7. **Mock external APIs** - Don't depend on external services
8. **Test responsive** - Verify mobile, tablet, desktop views
9. **Check accessibility** - Include basic a11y tests
10. **Keep tests fast** - Avoid unnecessary waits

## Resources

- [Full E2E Documentation](./e2e/README.md)
- [Playwright Docs](https://playwright.dev)
- [Test Helpers](./e2e/utils/test-helpers.ts)
- [Test Fixtures](./e2e/fixtures/test-data.ts)

## Getting Help

If you encounter issues:
1. Check test output and screenshots in `test-results/`
2. View HTML report: `pnpm test:e2e:report`
3. Run in debug mode: `pnpm test:e2e:debug`
4. Review relevant test file in `e2e/`
5. Check GitHub Actions logs if failing in CI
