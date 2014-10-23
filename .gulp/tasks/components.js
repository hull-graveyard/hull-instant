var gulp = require('gulp');
var config = require('../config').components;

gulp.task('components', function() {
  gulp.src(config.src).pipe(gulp.dest(config.dest));
});
