const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const { startServer } = require('polyserve');

const TEST_DIR = 'test';
const TEST_REF_DIR = `${TEST_DIR}/reference`;
const TEST_ACT_DIR = `${TEST_DIR}/screenshots`;
const TEST_URL = 'http://127.0.0.1';
const TEST_PORT = 4444;
const DESKTOP_DIR = 'desktop';
const MOBILE_DIR = 'mobile';

const compareScreenshots = (fileName) => {
  return new Promise((resolve, _reject) => {
    const img1 = PNG.sync.read(fs.readFileSync(`${TEST_ACT_DIR}/${fileName}`));
    const img2 = PNG.sync.read(fs.readFileSync(`${TEST_REF_DIR}/${fileName}`));

    const {width, height} = img1;

    expect(width, 'image widths are the same').equal(img2.width);
    expect(height, 'image heights are the same').equal(img2.height);

    const diff = new PNG({width, height});

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

    fs.writeFileSync(`${TEST_ACT_DIR}/diff.png`, PNG.sync.write(diff));
    expect(numDiffPixels, 'number of different pixels').equal(0);
    resolve();
  });
};

const takeAndCompareScreenshot = async (page, route = 'index', prefix) => {
  let fileName = `${prefix}/${route}`;

  await page.goto(`${TEST_URL}:${TEST_PORT}/${route}`);
  await page.screenshot({ path: `${TEST_ACT_DIR}/${fileName}.png`});

  return compareScreenshots(fileName);
};

describe('check screenshots are correct', function() {
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

  after((done) => polyserve.close(done));

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  describe('in desktop mode', async function() {
    await page.setViewport({ width: 1920, height: 1080 });

    it('for index page', async function() {
      return takeAndCompareScreenshot(page, 'index', DESKTOP_DIR)
    })
  });

  describe('in mobile mode', async function() {
    await page.setViewport({ width: 375, height: 667, isMobile: true });

    it('for index page', async function() {
      return takeAndCompareScreenshot(page, 'index', MOBILE_DIR)
    });
  })
});
