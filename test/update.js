const fs = require('fs');
const puppeteer = require('puppeteer');
const { startServer } = require('polyserve');

const TEST_DIR = 'test';
const TEST_REF_DIR = `${TEST_DIR}/reference`;
const TEST_URL = 'http://127.0.0.1';
const TEST_PORT = 4444;
const DESKTOP_DIR = 'desktop';
const MOBILE_DIR = 'mobile';

const takeReferenceScreenshots = async () => {
  let polyserve, browser, page;
  let route = 'index';

  polyserve = await startServer({ port: TEST_PORT });

  if(!fs.existsSync(TEST_REF_DIR)) {
    fs.mkdirSync(TEST_REF_DIR);
  }

  if(!fs.existsSync(`${TEST_REF_DIR}/${DESKTOP_DIR}`)) {
    fs.mkdirSync(`${TEST_REF_DIR}/${DESKTOP_DIR}`)
  }

  if(!fs.existsSync(`${TEST_REF_DIR}/${MOBILE_DIR}`)) {
    fs.mkdirSync(`${TEST_REF_DIR}/${MOBILE_DIR}`)
  }

  browser = await puppeteer.launch();
  page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto(`${TEST_URL}:${TEST_PORT}/${route}`);
  await page.screenshot({ path: `${TEST_REF_DIR}/${DESKTOP_DIR}/${route}.png`, fullPage: true });
  await browser.close();

  browser = await puppeteer.launch();
  page = await browser.newPage();

  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.goto(`${TEST_URL}:${TEST_PORT}/${route}`);
  await page.screenshot({ path: `${TEST_REF_DIR}/${MOBILE_DIR}/${route}.png`, fullPage: true });
  await browser.close();

  await polyserve.close();

  return 0;
};

takeReferenceScreenshots();
