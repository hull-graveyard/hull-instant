var gulp        = require('gulp');
var liquid      = require('gulp-liquid');
var rename      = require('gulp-rename');
var config      = require('../config').markup
var Yaml        = require('yamljs');

var env = Yaml.load('env.yml');

gulp.task('markup', function() {
  gulp.src(config.src)
    .pipe(rename({ suffix: ".liquid" }))
    .pipe(gulp.dest(config.dest));
  return gulp.src(config.src)
    .pipe(liquid({ locals: env }))
    .pipe(gulp.dest(config.dest));
});
