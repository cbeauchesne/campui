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
var imageResize = require('gulp-image-resize');
var svg2png = require('gulp-svg2png');

var browserSync = require('browser-sync').create();


gulp.task('spotlights_svg', function () {
  return gulp.src('app/static/campui/img_src/spotlights/*.svg')
    .pipe(svg2png())
    .pipe(gulp.dest('app/static/campui/img/spotlights/'));
});

gulp.task('spotlights_png', function () {
  return gulp.src('app/static/campui/img_src/spotlights/*.png')
    .pipe(imageResize({
      width : 22,
      height : 40,
      crop : true,
      upscale : false,
      imageMagick : true
    }))
    .pipe(gulp.dest('app/static/campui/img/spotlights/'));
});

gulp.task('sass', function(){
  return gulp.src('app/static/campui/scss/**/*.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('app/static/campui/css'))

    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('images', function(){
  return gulp.src('app/static/campui/img/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('static/campui/img'))
});

gulp.task('font-awesome', function() {
  return gulp.src(['bower_components/components-font-awesome/fonts/fontawesome-webfont.*'])
  .pipe(gulp.dest('static/campui/fonts'));
});

gulp.task('font-bootstrap', function() {
  return gulp.src(['bower_components/bootstrap/fonts/glyphicons-halflings-regular.*'])
  .pipe(gulp.dest('static/campui/fonts'));
});

gulp.task('font-ui-grid', function() {
  return gulp.src(['bower_components/angular-ui-grid/ui-grid.{ttf,eot,svg,woff}'])
  .pipe(gulp.dest('static/campui/css'));
});

gulp.task('font-slick', function() {
  return gulp.src(['bower_components/slick-carousel/slick/fonts/slick.{ttf,eot,svg,woff}'])
  .pipe(gulp.dest('static/campui/css/fonts'));
});

gulp.task('slick', function() {
  return gulp.src(['bower_components/slick-carousel/slick/ajax-loader.gif'])
  .pipe(gulp.dest('static/campui/css'));
});

gulp.task('fonts', ['font-awesome', 'font-bootstrap', 'font-ui-grid', 'font-slick'], function() {
  return gulp.src('app/static/campui/fonts/**/*.*')
  .pipe(gulp.dest('static/campui/fonts'))
})

gulp.task('html', function() {
  return gulp.src('app/static/campui/views/**/*')
  .pipe(gulp.dest('static/campui/views'))
})

gulp.task('angular-i18n', function() {
  return gulp.src('bower_components/angular-i18n/*.js')
  .pipe(gulp.dest('app/static/campui/angular-i18n'))
  .pipe(gulp.dest('static/campui/angular-i18n'))
})

gulp.task('photoswipe', function() {
  return gulp.src('bower_components/photoswipe/dist/default-skin/*.*')
  .pipe(gulp.dest('static/campui/css'))
})

function getServer(baseDir){
    return function() {

      var proxyApi = url.parse('http://localhost:8000/api');
      proxyApi.route = '/api';

      var proxyAnalytics = url.parse('http://localhost:8000/analytics');
      proxyAnalytics.route = '/analytics';

      var proxyAdmin = url.parse('http://localhost:8000/admin');
      proxyAdmin.route = '/admin';

      var middleware = function (req, res, next) {
        var fileName = url.parse(req.url);
        fileName = fileName.href.split(fileName.search).join("");
        if (fileName.indexOf("static/") < 0
            && fileName.indexOf("bower_components") < 0
            && fileName.indexOf("node_modules") < 0
            && fileName.indexOf("browser-sync-client") < 0
        ) {
            req.url = "/index.html";
        }

        return next();
      }

      var server = {
        baseDir: [baseDir, "."],
        middleware: [proxy(proxyApi), proxy(proxyAnalytics),proxy(proxyAdmin), middleware]
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
  return gulp.src(['app/static/campui/views/**/*.html', 'app/static/campui/js/**/*.js'])
    .pipe(gettext.extract('template.pot', {}))
    .pipe(gulp.dest('po/'))
});

gulp.task('po', function () {
  return gulp.src('po/**/*.po')
    .pipe(gettext.compile({format: 'json'}))
    .pipe(gulp.dest('static/campui/translations/'))
    .pipe(gulp.dest('app/static/campui/translations/'))
});

gulp.task('clean:build', function() {
  return del.sync(['static/campui', 'build.zip', 'index.html']);
})

gulp.task('watch', ['browserSync', 'sass', 'pot','po'], function(){
  gulp.watch('app/static/campui/scss/**/*.scss', ['sass']);

  gulp.watch(['app/static/campui/views/**/*.html','app/static/campui/js/**/*.js'], ["pot"]);
  gulp.watch('po/**/*.po', ['po']);

  gulp.watch(['app/static/campui/views/**/*.html','app/static/campui/js/**/*.js'], browserSync.reload);
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
