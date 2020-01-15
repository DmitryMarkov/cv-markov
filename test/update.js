const { startServers } = require('polyserve')
const puppeteer = require('puppeteer')

const createDirs = require('./util/createDirs')
const takeScreenshot = require('./util/takeScreenshot')
const routes = require('./config/routes')
const config = require('./config')

const { referenceDir, env, viewports } = config

;(async () => {
  const servers = await startServers({
    entrypoint: env.SRC_DIR,
    port: env.TEST_PORT,
  })
  createDirs(referenceDir, viewports)

  for await (const viewport of viewports) {
    const { name: viewportName, width, height } = viewport

    for await (const route of routes) {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.setViewport({ width, height })
      await takeScreenshot(page, route, viewportName, referenceDir)
      await browser.close()
    }
  }
  await servers.server.close()

  return 0
})()
