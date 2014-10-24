var gulp = require('gulp');
var po = require('pofile');
var gettext = require('gulp-angular-gettext');
var config = require('../config').translate;
var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');
var Yaml = require('yamljs');

var locales = false;
try {
  var manifest = Yaml.load('manifest.yml');
  locales = manifest.locales;
} catch(e) {}


function compile() {

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }
    var catalog = po.parse(file.contents.toString());
    var strings = {};
    for (var i = 0; i < catalog.items.length; i++) {
      var item = catalog.items[i];
      if (item.msgstr[0] && item.msgstr[0].length > 0) {
        strings[item.msgid] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
      } else {
        strings[item.msgid] = item.msgid;
      }
    }

    file.contents = new Buffer(JSON.stringify(strings, " ", 2));

    var dirname = path.dirname(file.path);
    var basename = path.basename(file.path, '.po');
    var extension = '.json';
    file.path = path.join(dirname, basename + extension);
    this.push(file);
    cb();
  });
};

gulp.task('translate', function() {
  if (locales && locales.length > 0) {
    return locales.map(function(locale) {
      return gulp.src(config.src)
          .pipe(gettext.extract(locale + '.po'))
          .pipe(compile())
          .pipe(gulp.dest(config.dest));
    })
  }
});

