const { startServers } = require('polyserve');
const puppeteer = require('puppeteer');

const createDirs = require('./util/createDirs');
const takeScreenshot = require('./util/takeScreenshot');
const routes = require('./config/routes');
const config = require('./config');

const { referenceDir, env, viewports } = config;

(async () => {
  let servers, browser, page;

  servers = await startServers({ port: env.TEST_PORT });
  createDirs(referenceDir, viewports);
  for await (const viewport of viewports) {
    const { name: viewportName, width, height } = viewport;

    for await (const route of routes) {
      browser = await puppeteer.launch();
      page = await browser.newPage();

      await page.setViewport({ width, height});
      await takeScreenshot(page, route, viewportName, referenceDir);
      await browser.close();
    }
  }
  await servers.server.close();

  return 0;
})();
