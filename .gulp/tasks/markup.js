var gulp        = require('gulp');
var liquid      = require('gulp-liquid');
var rename      = require('gulp-rename');
var config      = require('../config').markup
var Yaml        = require('yamljs');

var env = false;
try {
  env = Yaml.load('env.yml');
} catch(e) {}

gulp.task('markup', function() {
  return gulp.src(config.src).pipe(gulp.dest(config.dest));
});
