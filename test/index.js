const fs = require('fs');
const expect = require('chai').expect;
const PNG = require('pngjs').PNG;
const { startServers } = require('polyserve');
const puppeteer = require('puppeteer');

const createDirs = require('./util/createDirs');
const getPixelDiff = require('./util/getPixelDiff');
const takeScreenshot = require('./util/takeScreenshot');
const routes = require('./config/routes');
const config = require('./config');

const { referenceDir, testDir, env, viewports } = config;

describe('check screenshots are correct', async function() {
  let servers, browser, page;

  before(async () => {
    servers = await startServers({ port: env.TEST_PORT });
    createDirs(testDir, viewports);
  });

  after(async () => await servers.server.close());

  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(async () => await browser.close());

  for (const viewport of viewports) {
    const { name: viewportName, width, height } = viewport;

    context(`in ${viewportName} mode`, () => {
      for (const route of routes) {
        it(`for '/${route}' route`, async () => {
          await page.setViewport({ width, height });

          const referenceImage = PNG.sync.read(fs.readFileSync(`${referenceDir}/${viewportName}/${route}.png`));
          const testImage = await takeScreenshot(page, route, viewportName, testDir);

          expect(testImage.width, 'image widths are the same').equal(referenceImage.width);
          expect(testImage.height, 'image heights are the same').equal(referenceImage.height);
          const numDiffPixels = await getPixelDiff(testImage, referenceImage, viewportName, testDir);
          expect(numDiffPixels, 'number of different pixels').equal(0);
        })
      }
    });
  }
});
