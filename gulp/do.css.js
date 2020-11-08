module.exports = () => {
  $.gulp.task('do:css', () => {
    return $.gulp
      .src('./src/*.css')
      .pipe($.plugins.sourcemaps.init())
      .pipe(
        $.plugins.postcss([
          $.autoprefixer(),
          $.cssnano({
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
              },
            ],
          }),
        ])
      )
      .pipe($.plugins.sourcemaps.write('.'))
      .pipe($.gulp.dest($.config.dest))
  })
}
