const config = {
  dest: './build',
}

global.$ = {
  autoprefixer: require('autoprefixer'),
  cssnano: require('cssnano'),
  config,
  del: require('del'),
  gulp: require('gulp'),
  package: require('./package'),
  plugins: require('gulp-load-plugins')(),
}

$.gulp.task('clean', cb => {
  return $.del($.config.dest, cb)
})

$.gulp.task('copy:assets', () => {
  return $.gulp
    .src('./assets/**/*.*', { since: $.gulp.lastRun('copy:assets') })
    .pipe($.gulp.dest($.config.dest + '/assets'))
})

$.gulp.task('do:css', () => {
  return $.gulp
    .src('./src/main.css')
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
    .pipe($.gulp.dest($.config.dest + '/src/main.css'))
})

$.gulp.task('do:html', () => {
  return $.gulp
    .src('index.html')
    .pipe($.plugins.replace('${version}', $.package.version))
    .pipe($.plugins.htmlmin({ collapseWhitespace: true }))
    .pipe($.gulp.dest($.config.dest))
})

$.gulp.task('watch', () => {
  // todo
})

$.gulp.task(
  'default',
  $.gulp.series(
    'clean',
    $.gulp.parallel('copy:assets', 'do:css', 'do:html')
  )
)
