const config = {
  src: './src',
  dest: './build',
  faviconFile: 'faviconData.json',
  tasks: [
    './gulp/clean.js',
    './gulp/copy.assets.js',
    './gulp/do.css.js',
    './gulp/do.html.js',
    './gulp/favicon.generate.js',
    './gulp/favicon.check-for-update.js',
    './gulp/publish.js',
    './gulp/watch.js',
  ],
}

global.$ = {
  autoprefixer: require('autoprefixer'),
  cssnano: require('cssnano'),
  config,
  del: require('del'),
  fs: require('fs'),
  gulp: require('gulp'),
  package: require('./package'),
  plugins: require('gulp-load-plugins')(),
}

$.config.tasks.forEach(taskPath => {
  require(taskPath)()
})

$.gulp.task(
  'default',
  $.gulp.series(
    'clean',
    $.gulp.parallel('copy:assets', 'do:css', 'do:html')
  )
)
