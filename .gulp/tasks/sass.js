var gulp = require('gulp');
var sass = require('gulp-sass');
var handleErrors = require('../util/handleErrors');
var config=require('../config').sass;

var browserSync = require('browser-sync');
var reload      = browserSync.reload;

gulp.task('sass', ['images'], function () {
  return gulp.src(config.src)
    .pipe(sass())
    .on('error', handleErrors)
    .pipe(gulp.dest(config.dest))
    .pipe(reload({ stream: true }));
});
