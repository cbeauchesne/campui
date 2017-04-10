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
  .pipe(gulp.dest('dist/static/img'))
});

gulp.task('font-awesome', function() {
  return gulp.src(['app/static/components/components-font-awesome/fonts/fontawesome-webfont.*'])
  .pipe(gulp.dest('dist/static/fonts'));
});

gulp.task('font-bootstrap', function() {
  return gulp.src(['app/static/components/bootstrap/fonts/glyphicons-halflings-regular.*'])
  .pipe(gulp.dest('dist/static/fonts'));
});

gulp.task('font-ui-grid', function() {
  return gulp.src(['app/static/components/angular-ui-grid/ui-grid.{ttf,eot,svg,woff}'])
  .pipe(gulp.dest('dist/static/css'));
});

gulp.task('font-slick', function() {
  return gulp.src(['app/static/components/slick-carousel/slick/fonts/slick.{ttf,eot,svg,woff}'])
  .pipe(gulp.dest('dist/static/css/fonts'));
});

gulp.task('slick', function() {
  return gulp.src(['app/static/components/slick-carousel/slick/ajax-loader.gif'])
  .pipe(gulp.dest('dist/static/css'));
});

gulp.task('fonts', ['font-awesome', 'font-bootstrap', 'font-ui-grid', 'font-slick'], function() {
  return gulp.src('app/static/fonts/**/*.*')
  .pipe(gulp.dest('dist/static/fonts'))
})

gulp.task('html', function() {
  return gulp.src('app/static/views/**/*')
  .pipe(gulp.dest('dist/static/views'))
})

gulp.task('angular-i18n', function() {
  return gulp.src('app/static/components/angular-i18n/*.js')
  .pipe(gulp.dest('dist/static/angular-i18n'))
})

gulp.task('photoswipe', function() {
  return gulp.src('app/static/components/photoswipe/dist/default-skin/*.*')
  .pipe(gulp.dest('dist/static/css'))
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
            && fileName.indexOf("browser-sync-client") < 0
            && (
                fileName.indexOf("/outing") >= 0
                || fileName.indexOf("/route") >= 0
                || fileName.indexOf("/area") >= 0
                || fileName.indexOf("/waypoint") >= 0
                || fileName.indexOf("/me") >= 0
                || fileName.indexOf("/user") >= 0
                || fileName.indexOf("/article") >= 0
                || fileName.indexOf("/credit") >= 0
                || fileName.indexOf("/login") >= 0
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

gulp.task("test:dist",getServer('dist'))
gulp.task("browserSync",getServer('app'))

gulp.task('useref', function(){
  return gulp.src('app/index.html')
    .pipe(useref())

    .pipe(gulpIf('*.js', uglify().on('error', gulpUtil.log)))

    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('pot', function(){
  return gulp.src(['app/static/views/**/*.html', 'app/static/js/**/*.js'])
    .pipe(gettext.extract('template.pot', {}))
    .pipe(gulp.dest('po/'))
});

gulp.task('po', function () {
  return gulp.src('po/**/*.po')
    .pipe(gettext.compile({format: 'json'}))
    .pipe(gulp.dest('dist/static/translations/'))
    .pipe(gulp.dest('app/static/translations/'))
});

gulp.task('clean:dist', function() {
  return del.sync(['dist', 'build.zip']);
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
    '!app/', '!app/**',
    '!node_modules/', '!node_modules/**',
    '!bower_components/', '!bower_components/**'])
    .pipe(zip('build.zip'))
    .pipe(gulp.dest(''))
})

gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts', 'slick', 'photoswipe', 'po', 'angular-i18n', 'html'],
    ['zip'],
    callback
  )
})
