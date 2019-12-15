const fs = require('fs');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

const getPixelDiff = async (img1, img2, viewportName, dir) => {
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  fs.writeFileSync(`${dir}/${viewportName}/diff.png`, PNG.sync.write(diff));

  return pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
};

module.exports = getPixelDiff;
