var gulp = require('gulp');
var sass = require('gulp-sass');
var handleErrors = require('../util/handleErrors');
var config=require('../config').sass;

gulp.task('sass', ['images'], function () {
  console.warn('Sass: ', config);
  return gulp.src(config.src)
    .pipe(sass({ style: 'expanded' }))
    .on('error', handleErrors)
    .pipe(gulp.dest(config.dest));
});
