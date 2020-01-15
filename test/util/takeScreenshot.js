const fs = require('fs')
const PNG = require('pngjs').PNG

const config = require('../config')
const { env } = config

const takeScreenshot = async (page, route, viewportName, dir) => {
  await page.goto(`${env.TEST_URL}:${env.TEST_PORT}/${route}`, {
    waitUntil: 'networkidle0',
  })
  await page.screenshot({
    path: `${dir}/${viewportName}/${route}.png`,
    fullPage: true,
  })

  return PNG.sync.read(
    fs.readFileSync(`${dir}/${viewportName}/${route}.png`)
  )
}

module.exports = takeScreenshot
