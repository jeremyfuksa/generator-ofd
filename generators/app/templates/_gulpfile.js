'use strict';
// generated on <%= date %> using <%= name %> <%= version %>

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var autoprefixer = require('autoprefixer');
var clean = require('del');
var cssnano = require('cssnano');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var twig = require('gulp-twig');
var uncss = require('postcss-uncss');


var paths = {
  app: 'app/',
  build: 'build/',
  dist: 'dist/'
};

// ----------------------------------------------------------------------
// Server Tasks
// ----------------------------------------------------------------------

gulp.task('serve', function() {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: [paths.build],
      routes: {
        "/bower_components": "bower_components"
      }
    }
  });
  gulp.watch([
    paths.build + '*.html',
    paths.build + 'css/**/*',
    paths.build + 'js/**/*'
  ]).on('change', reload);
  gulp.watch(paths.app + 'templates/*.twig', ['compileTwig']);
  gulp.watch(paths.app + 'templates/**/*.twig', ['compileTwig']);
  gulp.watch(paths.app + 'styles/**/*.scss', ['compileStyles']);
  gulp.watch(paths.app + 'images/**/*', ['optimizeImages']);
  gulp.watch(paths.app + 'js/**/*.js', ['compileScripts']);
});

// ----------------------------------------------------------------------
// Utility Tasks
// ----------------------------------------------------------------------

// Clean out the build and dist directories
gulp.task('clean', function () {
  return clean([
    paths.build,
    paths.dist
  ]);
});

// Default task
gulp.task('default', ['clean', 'init']);

// Initialize the project
gulp.task('init', ['compileTwig', 'compileStyles', 'compileScripts', 'compileRoot']);

// ----------------------------------------------------------------------
// Development Tasks
// ----------------------------------------------------------------------

// Compile Root files
gulp.task('compileRoot', function () {
    return gulp.src(paths.app + '*.*')
      .pipe(gulp.dest(paths.build));
});

// Compile JS Scripts
gulp.task('compileScripts', function () {
  return gulp.src(paths.app + 'js/**/*.js')
    .pipe(gulp.dest(paths.build + 'js'));
});

// Compile SASS -> CSS
gulp.task('compileStyles', function () {
  clean(paths.build + 'css');
  return gulp.src(paths.app + 'styles/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions']
      })
    ]))
    .pipe(plumber.stop())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.build + 'css'));
});

// Compile Twig Templates
gulp.task('compileTwig', function () {
  return gulp.src(paths.app + 'templates/*.twig')
    .pipe(plumber())
    .pipe(twig())
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.build));
});

// Optimize images
gulp.task('optimizeImages', function () {
  return gulp.src(paths.app + 'images/**/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.build + 'images'));
});

// ----------------------------------------------------------------------
// Build Tasks
// ----------------------------------------------------------------------

// Prepare CSS for distribution
gulp.task('dist-css', ['compileStyles'], function () {
  var plugins = [
    uncss({
      html: [paths.build + '*.html']
    }),
    cssnano()
  ];
  return gulp.src(paths.build + 'css/**/*')
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.dist + 'css/'));
});

// Copy images to distribution
gulp.task('dist-img', ['optimizeImages'], function () {
  return gulp.src(paths.build + 'images/**/*')
    .pipe(paths.dist + 'images/');
})

// Prepare Javascript for distribution
gulp.task('dist-js', ['compileScripts'], function () {
  return gulp.src(paths.build + 'js/**/*')
    .pipe(gulp.dest(paths.dist + 'js/'));
});

// Copy root files to the distribution
gulp.task('dist-root', function () {
  return gulp.src(paths.build + '*.*')
  .pipe(gulp.dest(paths.dist));
});

gulp.task('dist', ['dist-root', 'dist-css', 'dist-img', 'dist-js']);
