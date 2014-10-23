var gulp        = require('gulp');
var config      = require('../config').templates;

console.warn('Templates config: ', config);

gulp.task('templates', function() {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest));
});
