var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var log = require('gulplog');
var rename = require('gulp-rename');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var through = require('through');
var htmlmin = require('gulp-htmlmin');

var isDist = process.argv.indexOf('serve') === -1;

gulp.task('css-index', function () {
    return gulp.src('public/stylesheets/index-styles.css')
    .pipe(isDist ? csso() : through())
    .pipe(isDist ? autoprefixer('last 2 versions', { map: false }) : through())
    .pipe(rename('index-styles.min.css'))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('css-admin', function () {
    return gulp.src('public/stylesheets/admin-styles.css')
    .pipe(isDist ? csso() : through())
    .pipe(isDist ? autoprefixer('last 2 versions', { map: false }) : through())
    .pipe(rename('admin-styles.min.css'))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('js-index', function () {
    var b = browserify({
      entries: 'public/javascripts/index/index.js',
      debug: true
    });
  
    return b.bundle()
      .pipe(source('public/javascripts/index/index.js'))
      .pipe(buffer())
      .pipe(isDist ? uglify() : through())
        .on('error', log.error)
      .pipe(rename('build.js'))
      .pipe(gulp.dest('public/javascripts/index/'));
});


gulp.task('js-admin', function () {
    var b = browserify({
      entries: 'public/javascripts/admin/index.js',
      debug: true
    });
  
    return b.bundle()
      .pipe(source('public/javascripts/admin/index.js'))
      .pipe(buffer())
      .pipe(isDist ? uglify() : through())
        .on('error', log.error)
      .pipe(rename('build.js'))
      .pipe(gulp.dest('public/javascripts/admin/'));
});


gulp.task('js-preview', function () {
    var b = browserify({
      entries: 'public/javascripts/preview/index.js',
      debug: true
    });
  
    return b.bundle()
      .pipe(source('public/javascripts/preview/index.js'))
      .pipe(buffer())
      .pipe(isDist ?  uglify() : through())
        .on('error', log.error)
      .pipe(rename('build.js'))
      .pipe(gulp.dest('public/javascripts/preview/'));
});

gulp.task('js-walks', function () {
  var b = browserify({
    entries: 'public/javascripts/walks/index.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('public/javascripts/walks/index.js'))
    .pipe(buffer())
    .pipe(isDist ?  uglify() : through())
      .on('error', log.error)
    .pipe(rename('build.js'))
    .pipe(gulp.dest('public/javascripts/walks/'));
});

gulp.task('css-index-watch', ['css-index'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('css-admin-watch', ['css-admin'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('js-index-watch', ['js-index'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('js-admin-watch', ['js-admin'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('js-preview-watch', ['js-preview'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('js-walks-watch', ['js-walks'], function (done) {
  browserSync.reload();
  done();
});
gulp.task('reload', function (done) {
    browserSync.reload();
    done();
});

gulp.task('js', ['js-preview', 'js-admin', 'js-index', 'js-walks']);
gulp.task('css', ['css-index', 'css-admin']);


gulp.task('license', () => {
    return gulp.src('mentions-legales.html')
      .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true }))
      .pipe(gulp.dest('public'));
});

gulp.task('default', ['js', 'css', 'license']);



gulp.task('serve', function () {

    browserSync.init({
        proxy: 'http://localhost:' + require('env-port')('8000')
    });

    gulp.watch('public/views/*.html', ['reload']);
    gulp.watch('views/*.ejs', ['reload']);

    gulp.watch('public/stylesheets/admin-styles.css', ['css-admin-watch']);
    gulp.watch('public/stylesheets/index-styles.css', ['css-index-watch']);
    gulp.watch(['public/javascripts/index/**/**.js', '!public/javascripts/index/build.js'], ['js-index-watch']);
    gulp.watch(['public/javascripts/walks/**/**.js', '!public/javascripts/walks/build.js'], ['js-walks-watch']);
    gulp.watch(['public/javascripts/admin/**/**.js', '!public/javascripts/admin/build.js'], ['js-admin-watch']);
    gulp.watch(['public/javascripts/preview/**/**.js', '!public/javascripts/preview/build.js'], ['js-preview-watch']);
});

