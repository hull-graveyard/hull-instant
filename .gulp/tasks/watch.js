/* Notes:
   - gulp/tasks/browserify.js handles js recompiling with watchify
   - gulp/tasks/browserSync.js watches and reloads compiled files
*/

var gulp = require('gulp');
var config = require('../config');

gulp.task('watch', ['setWatch', 'browserSync'], function() {
  gulp.watch(config.sass.src,   ['sass']);
  gulp.watch(config.images.src, ['images']);
  gulp.watch(config.markup.src, ['markup']);
  gulp.watch('./env.yml', ['markup']);
  gulp.watch(config.templates.schemaForm.src, ['templates']);
  gulp.watch(config.templates.hullInstant.src, ['templates']);
  gulp.watch("./manifest.yml", ['manifest']);
});
