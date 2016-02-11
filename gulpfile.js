////////////////////////////////////////
// Load Plugins
////////////////////////////////////////

var argv = require('yargs').argv,
    autoprefixer = require('gulp-autoprefixer'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    clean = require('gulp-clean'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    config = require('./config.json'),
    cssGlobbing = require('gulp-css-globbing'),
    DEST = 'public/',
    ENV = argv.e ? argv.e : 'dev',
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util');
    haml = require('gulp-haml'),
    imagemin = require('gulp-imagemin'),
    include = require('gulp-include'),
    jshint = require('gulp-jshint'),
    markdown = require('gulp-markdown'),
    minifyCSS = require('gulp-minify-css'),
    notify = require("gulp-notify"),
    onError = function(error) {
      gutil.beep();
      gutil.log(gutil.colors.red(error));
      console.log(error);
    },
    plumber = require('gulp-plumber'),
    preprocess = require('gulp-preprocess'),
    rename = require('gulp-rename'),
    revall = require('gulp-rev-all'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    using = require('gulp-using'),
    uglify = require('gulp-uglify'),
    _ = require('underscore'),
    fullConfig = _.extend(config['default'], config[ENV]),

function onPlumberError() {
  gutil.log(gutil.colors.red(error));
}

////////////////////////////////////////
// Process Assets
////////////////////////////////////////

// Haml
gulp.task('hamls', ['include'], function() {
  return gulp.src(DEST + '**/*.haml')
    .pipe(preprocess({context: { GULP_ENV: ENV, CONFIG: fullConfig }}))
    .pipe(changed(DEST, {extension: '.html'}))
    .pipe(plumber({errorHandler: notify.onError({title: 'ERROR', message: "<%= error.message %>"})}))
    .pipe(haml({ compiler: 'visionmedia' }))
    .pipe(gulp.dest(DEST))
    .pipe(connect.reload())
    .pipe(notify({title: 'Note:', message: "Haml <%= file.relative %> compiled"}));
});

// Styles
gulp.task('styles-dev', function() {
  return gulp.src('_build/css/main.scss')
    .pipe(plumber(onError))
    .pipe(cssGlobbing({
        extensions: ['.css', '.scss']
      }
    ))
    .pipe(sourcemaps.init())
    .pipe(sass({
        errLogToConsole: true,
        sourceComments: true,
        sourceMap: true
    }))
    .pipe(autoprefixer({
      browsers: ['> 5%', 'safari > 5', 'ie > 8', 'opera 12.1', 'ios > 6', 'android > 4']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST + '/css'))
    .pipe(rename(DEST + '/css/base.css'))
    .pipe(connect.reload())
    .pipe(notify({title: 'Note:', message: "Sass <%= file.relative %> compiled"}));
});

gulp.task('styles', function() {
  return gulp.src('_build/css/main.scss')
    .pipe(plumber(onError))
    .pipe(cssGlobbing({
        extensions: ['.css', '.scss']
      }
    ))
    .pipe(sass({
        errLogToConsole: true,
        sourceComments: 'map',
        sourceMap: true,
        style: 'compact'
    }))
    .pipe(autoprefixer({
      browsers: ['> 5%', 'safari > 5', 'ie > 8', 'opera 12.1', 'ios > 6', 'android > 4']
    }))
    .pipe(gulpif(argv.production, minifyCSS()))
    .pipe(gulp.dest(DEST + '/css'))
    .pipe(rename(DEST + '/css/base.css'))
    .pipe(connect.reload())
    .pipe(notify({title: 'Note:', message: "Sass <%= file.relative %> compiled"}));
});


// Coffee
gulp.task('coffeescripts', function() {
  return gulp.src(['_build/js/**/*.coffee',
                   '_build/js/*.coffee'],
                  { base: '_build/'})
    .pipe(plumber(onError))
    .pipe(concat('base.coffee'))
    .pipe(coffee())
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest(DEST + '/js'))
    .pipe(rename(DEST + '/js/app.js'))
    .pipe(connect.reload())
    .pipe(notify({title: 'Note:', message: "Coffee <%= file.relative %> compiled"}));
});


// JS
gulp.task('javascripts', ['coffeescripts'], function() {
  return gulp.src(['_build/js/**/*.js',
                  DEST + '/js/**/*.js'])
    .pipe(plumber(onError))
    .pipe(concat('base.js'))
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest(DEST + '/js'))
    .pipe(rename(DEST + '/js/base.js'))
    .pipe(connect.reload());
});

gulp.task('extend', function () {
  return gulp.src('_build/**/*.html')
    .pipe(plumber(onError))
    .pipe(extender({annotations:true,verbose:false}))
    .pipe(gulp.dest(DEST))
    .pipe(connect.reload());
});

gulp.task('include', function () {
  return gulp.src(['_build/**/*.html', '_build/**/*.haml'])
    .pipe(plumber(onError))
    .pipe(include())
    .pipe(gulp.dest(DEST));
});


gulp.task('version', ['styles', 'javascripts', 'include', 'hamls'], function() {
  return gulp.src(DEST + '/**')
    .pipe(plumber(onError))
    .pipe(revall({
            ignore: ['.html'],
          }))
    .pipe(gulp.dest(DEST))
    .pipe(connect.reload());

});


////////////////////////////////////////
// Copy Static Files (img, fonts)
////////////////////////////////////////

// Copy images
gulp.task('copy-images', function() {
  return gulp.src('_build/img/**/*.*', { cwd: './' })
    .pipe(gulp.dest(DEST + '/img'));
});


// Copy fonts
gulp.task('copy-fonts', function() {
  return gulp.src('_build/fonts/**/*.*', { cwd: './' })
    .pipe(gulp.dest(DEST + '/fonts'));
});


////////////////////////////////////////
// Clean Output Directories
////////////////////////////////////////

// Clean
gulp.task('clean', function() {
  return gulp.src(DEST + '*', {read: false})
    .pipe(clean());
});

// Clean
gulp.task('clean-excess', ['include', 'hamls'], function() {
  return gulp.src([DEST+'views', DEST+'partials'], {read: false})
    .pipe(plumber(onError))
    .pipe(clean({force: true}))
    .pipe(gulp.dest(DEST));
});


////////////////////////////////////////
// Watch files & rebuild when needed
////////////////////////////////////////
//
gulp.task('watch', function() {

  // Watch .haml files
  gulp.watch(['_build/**/*.haml', '_build/**/*.html'], ['hamls']);

  // Watch .scss files
  gulp.watch('_build/css/**/*.scss', ['styles-dev']);

  // Watch js/coffee files
  gulp.watch(['_build/js/**/*.js', '_build/js/*.coffee', '_build/js/**/*.coffee',], ['coffeescripts', 'javascripts']);

  // Watch image files
  gulp.watch(['_build/img/**/*.*'], ['copy-images']);

  // Watch font files
  gulp.watch(['_build/fonts/**/*.*'], ['copy-fonts']);


});
//

////////////////////////////////////////
// Entry Points - default build tasks
////////////////////////////////////////

// Default development task (live reload, etc)
gulp.task('default', ['connect', 'clean', 'watch'], function() {
    gulp.start('styles-dev', 'coffeescripts', 'javascripts', 'include', 'hamls', 'copy-images', 'copy-fonts', 'clean-excess');
});


// Build development task - $ gulp build
gulp.task('build', ['clean'], function() {
    gulp.start('styles', 'coffeescripts', 'javascripts', 'include', 'hamls', 'copy-images', 'copy-fonts', 'clean-excess');
});


gulp.task('connect', function() {
  connect.server({
    root: 'public',
    livereload: true
  });
});
