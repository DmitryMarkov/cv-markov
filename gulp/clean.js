module.exports = () => {
  $.gulp.task('clean', cb => {
    return $.del($.config.dest, cb)
  })
}
