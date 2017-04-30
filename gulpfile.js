var gulp = require('gulp');

var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var gulpIf = require('gulp-if');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var url = require('url');
var proxy = require('proxy-middleware');
var fs = require("fs");
var gettext = require('gulp-angular-gettext');
var gulpUtil = require('gulp-util');
var zip = require('gulp-zip');

var browserSync = require('browser-sync').create();

gulp.task('sass', function(){
  return gulp.src('app/static/scss/**/*.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('app/static/css'))

    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('images', function(){
  return gulp.src('app/static/img/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('static/img'))
});

gulp.task('font-awesome', function() {
  return gulp.src(['bower_components/components-font-awesome/fonts/fontawesome-webfont.*'])
  .pipe(gulp.dest('static/fonts'));
});

gulp.task('font-bootstrap', function() {
  return gulp.src(['bower_components/bootstrap/fonts/glyphicons-halflings-regular.*'])
  .pipe(gulp.dest('static/fonts'));
});

gulp.task('font-ui-grid', function() {
  return gulp.src(['bower_components/angular-ui-grid/ui-grid.{ttf,eot,svg,woff}'])
  .pipe(gulp.dest('static/css'));
});

gulp.task('font-slick', function() {
  return gulp.src(['bower_components/slick-carousel/slick/fonts/slick.{ttf,eot,svg,woff}'])
  .pipe(gulp.dest('static/css/fonts'));
});

gulp.task('slick', function() {
  return gulp.src(['bower_components/slick-carousel/slick/ajax-loader.gif'])
  .pipe(gulp.dest('static/css'));
});

gulp.task('fonts', ['font-awesome', 'font-bootstrap', 'font-ui-grid', 'font-slick'], function() {
  return gulp.src('app/static/fonts/**/*.*')
  .pipe(gulp.dest('static/fonts'))
})

gulp.task('html', function() {
  return gulp.src('app/static/views/**/*')
  .pipe(gulp.dest('static/views'))
})

gulp.task('angular-i18n', function() {
  return gulp.src('bower_components/angular-i18n/*.js')
  .pipe(gulp.dest('app/static/angular-i18n'))
  .pipe(gulp.dest('static/angular-i18n'))
})

gulp.task('photoswipe', function() {
  return gulp.src('bower_components/photoswipe/dist/default-skin/*.*')
  .pipe(gulp.dest('static/css'))
})

function getServer(baseDir){
    return function() {

      var proxyOptions = url.parse('http://localhost:8000/api');
      proxyOptions.route = '/api';

      var middleware = function (req, res, next) {
        var fileName = url.parse(req.url);
        fileName = fileName.href.split(fileName.search).join("");
        if (fileName.indexOf("static/") < 0
            && fileName.indexOf("bower_components") < 0
            && fileName.indexOf("node_modules") < 0
            && fileName.indexOf("browser-sync-client") < 0
            && (
                fileName.indexOf("/outing") >= 0
                || fileName.indexOf("/route") >= 0
                || fileName.indexOf("/area") >= 0
                || fileName.indexOf("/waypoint") >= 0
                || fileName.indexOf("/me") >= 0
                || fileName.indexOf("/user") >= 0
                || fileName.indexOf("/article") >= 0
                || fileName.indexOf("/search") >= 0
                || fileName.indexOf("/credit") >= 0
                || fileName.indexOf("/register") >= 0
                || fileName.indexOf("/login") >= 0
                || fileName.indexOf("/faq") >= 0
                || fileName.indexOf("/markdown") >= 0
                || fileName.indexOf("/outing-images") >= 0
                || fileName.indexOf("/xreport") >= 0)
        ) {
            req.url = "/index.html";
        }

        return next();
      }

      var server = {
        baseDir: [baseDir, "."],
        middleware: [proxy(proxyOptions), middleware]
      }

      browserSync.init({
        server: server,
        port: 3000,
        logLevel: "debug",
      })
    }
}

gulp.task("browserSync",getServer('app'))

gulp.task('useref', function(){
  return gulp.src('app/index.html')
    .pipe(useref())

    .pipe(gulpIf('*.js', uglify().on('error', gulpUtil.log)))

    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(''))
});

gulp.task('pot', function(){
  return gulp.src(['app/static/views/**/*.html', 'app/static/js/**/*.js'])
    .pipe(gettext.extract('template.pot', {}))
    .pipe(gulp.dest('po/'))
});

gulp.task('po', function () {
  return gulp.src('po/**/*.po')
    .pipe(gettext.compile({format: 'json'}))
    .pipe(gulp.dest('static/translations/'))
    .pipe(gulp.dest('app/static/translations/'))
});

gulp.task('clean:build', function() {
  return del.sync(['static', 'build.zip', 'index.html']);
})

gulp.task('watch', ['browserSync', 'sass', 'pot','po'], function(){
  gulp.watch('app/static/scss/**/*.scss', ['sass']);

  gulp.watch(['app/static/**/*.html','app/static/js/**/*.js'], ["pot"]);
  gulp.watch('po/**/*.po', ['po']);

  gulp.watch(['app/static/**/*.html','app/static/js/**/*.js'], browserSync.reload);
  gulp.watch('app/index.html', browserSync.reload);

})

gulp.task('default', function (callback) {
  runSequence(['sass','pot','po','browserSync', 'watch'],
    callback
  )
})

gulp.task('zip', function() {
  return gulp.src(['./**',
    '.ebextensions/**',
    '!build.zip',
    '!app/', '!app/**',
    '!node_modules/', '!node_modules/**',
    '!env/', '!env/**',
    '!bower_components/', '!bower_components/**'],{base : './'})
    .pipe(zip('build.zip'))
    .pipe(gulp.dest(''))
})

gulp.task('build', function (callback) {
  runSequence('clean:build',
    ['sass'],
    ['useref', 'images', 'fonts', 'slick', 'photoswipe', 'po', 'angular-i18n', 'html'],
    ['zip'],
    callback
  )
})
