import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'desktop', width: 1280, height: 1080 },
  { name: 'mobile', width: 375, height: 667 },
]

for (const { name, width, height } of viewports) {
  test.describe(name, () => {
    test.use({ viewport: { width, height } })

    test('index page', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveScreenshot(`${name}-index.png`, {
        fullPage: true,
        maxDiffPixels: 0,
      })
    })
  })
}
