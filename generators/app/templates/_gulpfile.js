'use strict';
// generated on 2019-03-21 using generator-ofd 1.0.0
const {
  series,
  watch,
  parallel,
  src,
  dest
} = require('gulp');
var gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  autoprefixer = require('autoprefixer'),
  del = require('del'),
  cssnano = require('cssnano'),
  imagemin = require('gulp-imagemin'),
  plumber = require('gulp-plumber'),
  postcss = require('gulp-postcss'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  twig = require('gulp-twig'),
  uncss = require('postcss-uncss');

var paths = {
  app: 'app/',
  build: 'build/',
  dist: 'dist/'
};

// ----------------------------------------------------------------------
// Server Tasks
// ----------------------------------------------------------------------

function reload(done) {
  browserSync.reload();
  done();
}

function serve(done) {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: [paths.build]
    }
  });
  watch([
    paths.build + '*.html',
    paths.build + 'css/**/*',
    paths.build + 'js/**/*'
  ]).on('change', reload);
  watch(paths.app + 'templates/*.twig').on('change', compileTwig);
  watch(paths.app + 'templates/**/*.twig').on('change', compileTwig);
  watch(paths.app + 'styles/**/*.scss').on('change', compileStyles);
  watch(paths.app + 'images/**/*').on('change', optimizeImages);
  watch(paths.app + 'js/**/*.js').on('change', compileScripts);
  done();
}

// ----------------------------------------------------------------------
// Utility Tasks
// ----------------------------------------------------------------------

const init = parallel(
    compileRoot,
    compileScripts,
    compileStyles,
    compileTwig
  );

// Clean out the build and dist directories
function clean() {
  return del([
    paths.build,
    paths.dist
  ]);
}

// ----------------------------------------------------------------------
// Development Tasks
// ----------------------------------------------------------------------

// Compile Root files
function compileRoot() {
  return src(paths.app + '*.*')
    .pipe(dest(paths.build));

}

// Compile JS Scripts
function compileScripts() {
  return src(paths.app + 'js/**/*.js')
    .pipe(dest(paths.build + 'js'));

}

// Compile SASS -> CSS
function compileStyles() {
  del(paths.build + 'css');
  var plugins = [
    uncss({
      html: [paths.build + '*.html']
    }),
    autoprefixer({
      browsers: ['last 2 versions']
    }),
    cssnano()
  ];
  return src(paths.app + 'styles/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(plumber.stop())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.build + 'css'));
}

// Compile Twig Templates
function compileTwig() {
  return src(paths.app + 'templates/*.twig')
    .pipe(plumber())
    .pipe(twig())
    .pipe(plumber.stop())
    .pipe(dest(paths.build));

}

// Optimize images
function optimizeImages() {
  return src(paths.app + 'images/**/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(plumber.stop())
    .pipe(dest(paths.build + 'images'));

}

// ----------------------------------------------------------------------
// Build Tasks
// ----------------------------------------------------------------------

// Prepare CSS for distribution
function buildCss() {
  var plugins = [
    uncss({
      html: [paths.build + '*.html']
    }),
    cssnano()
  ];
  return src(paths.build + 'css/**/*')
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(plumber.stop())
    .pipe(dest(paths.dist + 'css/'));

}

// Copy images to distribution
function buildImages() {
  return src(paths.build + 'images/**/*')
    .pipe(paths.dist + 'images/');

}

// Prepare Javascript for distribution
function buildScripts() {
  return src(paths.build + 'js/**/*')
    .pipe(dest(paths.dist + 'js/'));

}

// Copy root files to the distribution
function buildRoot() {
  return src(paths.build + '*.*')
    .pipe(dest(paths.dist));

}

// -----------------------------------------------------
// Exports
// -----------------------------------------------------


exports.styles = compileStyles;
exports.serve = serve;
exports.init = init;
exports.default = series(clean, init);
exports.build = series(
  init,
  buildRoot,
  optimizeImages,
  buildImages,
  buildScripts
);
