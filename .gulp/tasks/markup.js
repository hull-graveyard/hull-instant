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
  gulp.src(config.src)
    .pipe(rename({ suffix: ".liquid" }))
    .pipe(gulp.dest(config.dest));
  return env && gulp.src(config.src)
    .pipe(liquid({ locals: env }))
    .pipe(gulp.dest(config.dest));
});
