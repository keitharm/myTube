var gulp       = require('gulp');
var source     = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify   = require('watchify');
var reactify   = require('reactify');
var concat     = require('gulp-concat');

var handleErrors = require('./handleErrors');

gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['./src/App.js'], // Only need initial file, browserify finds the deps
        transform: [reactify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}
    });
    var watcher  = watchify(bundler);

    return watcher
    .on('update', function () { // When any files update
        var updateStart = Date.now();
        console.log('Updating!');
        watcher.bundle() // Create new bundle that uses the cache for high performance
        .on('error', handleErrors)
        .pipe(source('build.min.js'))
    // This is where you add uglifying etc.
        .pipe(gulp.dest('./public/js/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle() // Create the initial bundle when starting the task
    .pipe(source('build.min.js'))
    .pipe(gulp.dest('./public/js/'));
});

// Just running the two tasks
gulp.task('default', ['browserify']);

function handleError(err) {
    notify.onError({
        message: "<%= error.message %>"
    }).apply(this, arguments);

    this.emit('end');
}
