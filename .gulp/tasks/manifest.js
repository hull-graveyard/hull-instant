var gulp = require('gulp');
var yaml = require('gulp-yaml');
var config = require('../config').manifest;

gulp.task('manifest', function() {
  return gulp.src(config.src)
    .pipe(yaml())
    .pipe(gulp.dest(config.dest));
});
