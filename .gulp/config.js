var dest = "./dist";
var src = './src';

module.exports = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + "/**",
      // Exclude Map files
      "!" + dest + "/**.map"
    ],
    open: true,
    port: (process.env.PORT || 3000)
  },
  sass: {
    src: src + "/sass/*.scss",
    dest: dest + "/assets/css/"
  },
  images: {
    src: src + "/images/**",
    dest: dest + "/assets/images"
  },
  markup: {
    src: src + "/*.html",
    dest: dest
  },
  templates: {
    src: src + "/templates/**/*.html",
    dest: dest + "/templates"
  },
  components: {
    src: src + "/aura_components/**",
    dest: dest + "/aura_components"
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: './src/javascript/app.js',
      dest: dest,
      outputName: 'assets/js/app.js'
    }]
  },
  manifest: {
    src: './manifest.yml',
    dest: dest
  }
};
