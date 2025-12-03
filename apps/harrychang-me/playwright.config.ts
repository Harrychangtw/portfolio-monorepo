import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Test main domain
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      },
    },

    /* Lab subdomain tests - run separately */
    {
      name: 'lab-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_LAB_URL || 'http://lab.localhost:3001',
      },
      testMatch: /.*lab.*.spec.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : [
    {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 120000,
    },
    {
      command: 'pnpm dev:lab',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 120000,
    },
  ],
})
