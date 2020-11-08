const FAVICON_DATA_FILE = 'faviconData.json'

// EXAMPLE
// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
module.exports = () => {
  $.gulp.task('favicon:inject-markups', function() {
    return $.gulp
      .src(['build/index.html'])
      .pipe(
        $.plugins.realFavicon.injectFaviconMarkups(
          JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code
        )
      )
      .pipe($.gulp.dest('build'))
  })
}
