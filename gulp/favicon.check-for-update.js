// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
module.exports = () => {
  $.gulp.task('favicon:check-for-update', done => {
    const currentVersion = JSON.parse(
      $.fs.readFileSync($.config.faviconFile)
    ).version
    $.plugins.realFavicon.checkForUpdates(currentVersion, err => {
      if (err) {
        throw err
      }
      done()
    })
  })
}
