module.exports = () => {
  $.gulp.task(
    'publish',
    $.gulp.series(
      'clean',
      $.gulp.parallel(
        'copy:assets',
        'do:css',
        'do:html',
        'favicon:generate'
      )
    )
  )
}
