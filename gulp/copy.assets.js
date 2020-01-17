module.exports = () => {
  $.gulp.task('copy:assets', () => {
    return $.gulp
      .src('./assets/**/*.*', { since: $.gulp.lastRun('copy:assets') })
      .pipe($.gulp.dest($.config.dest + '/assets'))
  })
}
