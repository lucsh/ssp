var gulp=require('gulp');
var sass=require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var plumber = require('gulp-plumber');
var inject = require('gulp-inject');
var image = require('gulp-image');
var del = require('del');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'//nested, expanded, compact, compressed
};

gulp.task('clean', function(cb){
  del(['dist'], cb);
});

gulp.task('imageOptim', function () {
  gulp.src('src/img/**/*')
    .pipe(image())
    .pipe(gulp.dest('dist/img'));
});


gulp.task('vendorStyles', function(){
  bootstrapCss = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
  animateCss = gulp.src('./node_modules/animate.css/animate.css');

  return merge(bootstrapCss, animateCss)
    .pipe(concat('vendor.css'))
    .pipe(csso({
        restructure: true,
        sourceMap: false,
        debug: false
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('sass', function(){
	gulp.src('src/scss/styles.scss')
  .pipe(plumber())
	.pipe(autoprefixer())
  .pipe(sass({
		includedPaths:['scss']
	}))
	.pipe(sass(sassOptions).on('error', sass.logError))
	.pipe(gulp.dest('dist/css'));
});

gulp.task('js',function(){
  gulp.src('src/js/*.js')
  .pipe(concat('scripts.js'))
  .pipe(browserify())
  .pipe(uglify())
  .pipe(gulp.dest('dist/js'))
  .pipe(reload({stream:true}))
});

gulp.task('html',function(){
  return gulp.src('src/*.html')
  .pipe(plumber())
  .pipe(htmlmin({collapseWhitespace:true}))
  .pipe(gulp.dest('dist'))
});

gulp.task('copyDependencies',function(){
  gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woof2}')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('serve', ['sass'], function() {
  browserSync.init(["dist/css/*.css", "dist/js/*.js", "dist/*.html"], {
    server: {
      baseDir: 'dist'
    }
  });
});

gulp.task('watch',['sass','vendorStyles','serve','js','copyDependencies','html','imageOptim'], function(){
  gulp.watch(['src/scss/*.scss'],['sass']);
  gulp.watch(['src/*.html'],['html']);
  gulp.watch(['src/js/*.js'],['js']);
});

gulp.task('default',['watch'])