const fs = require('fs')

function createDirs(baseDir, viewports) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }
  viewports.forEach(viewport => {
    if (!fs.existsSync(`${baseDir}/${viewport.name}`)) {
      fs.mkdirSync(`${baseDir}/${viewport.name}`)
    }
  })
}

module.exports = createDirs
