const fs = require('fs');
const expect = require('chai').expect;
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const { startServer } = require('polyserve');
const puppeteer = require('puppeteer');

const TEST_DIR = 'test';
const TEST_REF_DIR = `${TEST_DIR}/reference`;
const TEST_ACT_DIR = `${TEST_DIR}/screenshots`;
const TEST_URL = 'http://127.0.0.1';
const TEST_PORT = 4444;
const DESKTOP_DIR = 'desktop';
const MOBILE_DIR = 'mobile';
let route = 'index';

const takeScreenshot = async (page, dir) => {
  await page.goto(`${TEST_URL}:${TEST_PORT}/${route}`, { waitUntil: 'networkidle0'});
  await page.screenshot({ path: `${TEST_ACT_DIR}/${dir}/${route}.png`, fullPage: true });

  return PNG.sync.read(fs.readFileSync(`${TEST_ACT_DIR}/${dir}/${route}.png`));
};

const getDiffPixels = async (img1, img2, dir) => {
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  fs.writeFileSync(`${TEST_ACT_DIR}/${dir}/diff.png`, PNG.sync.write(diff));

  return pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
};

describe('check screenshots are correct', async function() {
  let polyserve, browser, page;

  before(async function() {
    polyserve = await startServer({ port: TEST_PORT });

    if(!fs.existsSync(TEST_ACT_DIR)) {
      fs.mkdirSync(TEST_ACT_DIR);
    }

    if(!fs.existsSync(`${TEST_ACT_DIR}/${DESKTOP_DIR}`)) {
      fs.mkdirSync(`${TEST_ACT_DIR}/${DESKTOP_DIR}`)
    }

    if(!fs.existsSync(`${TEST_ACT_DIR}/${MOBILE_DIR}`)) {
      fs.mkdirSync(`${TEST_ACT_DIR}/${MOBILE_DIR}`)
    }
  });

  after(async () => await polyserve.close());

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(async () => await browser.close());

  context('in desktop mode', function() {
    it('for index page', async function() {
        await page.setViewport({ width: 1280, height: 1080 });

        const img1 = await takeScreenshot(page, DESKTOP_DIR);
        const img2 = PNG.sync.read(fs.readFileSync(`${TEST_REF_DIR}/${DESKTOP_DIR}/${route}.png`));
        const numDiffPixels = await getDiffPixels(img1, img2, DESKTOP_DIR);

        expect(img1.width, 'image widths are the same').equal(img2.width);
        expect(img1.height, 'image heights are the same').equal(img2.height);
        expect(numDiffPixels, 'number of different pixels').equal(0);
    })
  });

  context('in mobile mode', function() {
    it('for index page', async function() {
      await page.setViewport({ width: 375, height: 667, isMobile: true });

      const img1 = await takeScreenshot(page, MOBILE_DIR);
      const img2 = PNG.sync.read(fs.readFileSync(`${TEST_REF_DIR}/${MOBILE_DIR}/${route}.png`));
      const numDiffPixels = await getDiffPixels(img1, img2, MOBILE_DIR);

      expect(img1.width, 'image widths are the same').equal(img2.width);
      expect(img1.height, 'image heights are the same').equal(img2.height);
      expect(numDiffPixels, 'number of different pixels').equal(0);
    });
  })
});
