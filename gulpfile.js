'use strict';


// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var sass = require('gulp-sass');
var prettyHtml = require('gulp-pretty-html');
var autoprefixer = require('gulp-autoprefixer');
var sassdoc = require('sassdoc');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var siteOutput = 'public';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var input = 'dev/src/scss/**/*.scss';
var inputHtml = 'public/**/*.html';
var inputMain = 'dev/src/scss/style.scss';
var output = 'docs/css';
var inputTemplates = 'dev/pages/*.njk';
var sassOptions = { outputStyle: 'expanded' };
var autoprefixerOptions = { browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] };
var sassdocOptions = { dest: siteOutput + '/sassdoc' };

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------

gulp.task('sass', function () {
  return gulp
  .src(inputMain)
  .pipe(sass(sassOptions).on('error', sass.logError))
  .pipe(autoprefixer(autoprefixerOptions))
  .pipe(gulp.dest(output))
  .pipe(browserSync.stream());
});

// -----------------------------------------------------------------------------
// HTML prettify compilation
// -----------------------------------------------------------------------------
 
gulp.task('pretty-html', function () {
  return gulp
      .src('./public/*.html')
      .pipe(prettyHtml({
        indent_size: 4,
        indent_char: ' ',
        preserve_newlines: false
    }))
      .pipe(gulp.dest('./docs/'));
});

// -----------------------------------------------------------------------------
// Templating
// -----------------------------------------------------------------------------

gulp.task('nunjucks', function () {
  nunjucksRender.nunjucks.configure(['dev/templates']);
  // Gets .html and .nunjucks files in pages
  return gulp.src(inputTemplates)
    // Renders template with nunjucks
    .pipe(nunjucksRender())
    // output files in dist folder
    .pipe(gulp.dest(siteOutput))
});

// -----------------------------------------------------------------------------
// Imagemin
// -----------------------------------------------------------------------------

gulp.task('img', function () {
  return gulp.src('./img/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(siteOutput + '/img'));
});

// -----------------------------------------------------------------------------
// Fonts
// -----------------------------------------------------------------------------

// gulp.task('fonts', function() {
//   return gulp.src(['./fonts/*'])
//   .pipe(gulp.dest(siteOutput + '/fonts/'));
// });

// -----------------------------------------------------------------------------
// Sass documentation generation
// -----------------------------------------------------------------------------

gulp.task('sassdoc', function () {
  return gulp
    .src(input)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task('watch', function () {
  // Watch the sass input folder for change,
  // and run `sass` task when something happens
  gulp.watch(input, ['sass']).on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  // Watch the sass input folder for change,
  // and run `sass` task when something happens
  gulp.watch(inputHtml, ['pretty-html']);

  // Watch nunjuck templates and reload browser if change
  gulp.watch(inputTemplates, ['nunjucks']).on('change', browserSync.reload);
});

// -----------------------------------------------------------------------------
// Static server
// -----------------------------------------------------------------------------

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: './docs/'
    }
  });
});

// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['sass', 'nunjucks', 'pretty-html', 'img', 'watch', 'browser-sync']);