import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4444',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'yarn preview',
    url: 'http://127.0.0.1:4444',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
