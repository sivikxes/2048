'use strict';
const gulp            = require('gulp');
const sourcemaps      = require('gulp-sourcemaps');
const sass            = require('gulp-sass');
const autoprefixer    = require('gulp-autoprefixer');
const rename          = require("gulp-rename");
const notify          = require("gulp-notify");
const plumber         = require('gulp-plumber');
const cssmin          = require('gulp-cssmin');
const concat          = require('gulp-concat');
const uglify          = require('gulp-uglify');


// =============================================================================
// Settings variables
// =============================================================================
const src = {
    sassWatch: './src/sass/**/*.scss',
    sass: './src/sass/*.scss',
    jsMain: './src/js/modules/**/*.js',
    jsLibs: './src/js/libs/**/*.js'
};

const dest = {
    sass: './public/css',
    js: './public/js'
};


// =============================================================================
// Task: sass-nested (compile Sass to css)
// =============================================================================
gulp.task( 'sass:nested', function(cb) {
    try {
        return gulp.src( src.sass)
            .pipe(plumber({errorHandler:notify.onError}))
            .pipe(sourcemaps.init())
            .pipe(sass({
                style: 'compressed',
                errLogToConsole: true
            }).on('error',sass.logError))
            .pipe( autoprefixer( {
                browsers: [ 'last 15 versions' ],
                cascade: false
            } ) )
            .pipe(cssmin())
            .pipe(sourcemaps.write())
            .pipe( gulp.dest( dest.sass ) );
    } catch(err){
        console.log('error ',err);
        if (cb) cb();
    }

} );

// =============================================================================
// Task: js-libs (compile all js libs to 1 minify file)
// =============================================================================
gulp.task( 'js:libs', function() {
    return gulp.src(src.jsLibs)
        .pipe( plumber() )
        .pipe( concat( 'libs.js' ) )
        .pipe( uglify() )
        .pipe( rename( { suffix: '.min', extname: '.js' } ) )
        .pipe( gulp.dest( dest.js ) );
});
gulp.task( 'js:main', function() {
    return gulp.src(src.jsMain)
        .pipe( plumber() )
        .pipe( concat( 'main.js' ) )
        .pipe( uglify() )
        .pipe( rename( { suffix: '.min', extname: '.js' } ) )
        .pipe( gulp.dest( dest.js ) );
});
// =============================================================================
// Task: watch (changes scanner)
// =============================================================================
gulp.task( 'watch', function() {
    gulp.watch( src.sassWatch, ['sass:nested']);
    gulp.watch( src.jsMain, ['js:main'] );
});

// =============================================================================
// Task: build (build all files)
// =============================================================================
gulp.task( 'build', ['sass:nested','js:main','js:libs']);

// =============================================================================
// Task: default
// =============================================================================
gulp.task( 'default', ['watch']);