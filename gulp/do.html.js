module.exports = () => {
  $.gulp.task('do:html', () => {
    return $.gulp
      .src($.config.src + '/index.html')
      .pipe($.plugins.replace('$version', $.package.version))
      .pipe($.plugins.htmlmin({ collapseWhitespace: true }))
      .pipe($.gulp.dest($.config.dest))
  })
}
