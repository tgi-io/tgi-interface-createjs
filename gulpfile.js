/**---------------------------------------------------------------------------------------------------------------------
 * tgi-core/gulpfile.js
 */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var childProcess = require('child_process');

// Source and _packaging
var libFiles = [
  'lib/_packaging/lib-header',
  'node_modules/tgi-core/dist/tgi.core.chunk.js',
  'lib/tgi-interface-createjs.lib.js',
  'lib/tgi-interface-createjs.source.js',
  'lib/tgi-interface-createjs-stage.source.js',
  'lib/tgi-interface-createjs-navigation.source.js',
  'lib/tgi-interface-createjs-queries.source.js',
  'lib/tgi-interface-createjs-panels.source.js',
  'lib/_packaging/lib-footer'
];

// The Spec
var specFiles = [
  'node_modules/tgi-core//lib/_packaging/spec-header',
  'lib/_packaging/spec-header',
  'node_modules/tgi-core/dist/tgi.core.spec.chunk.js',
  //'lib/tgi-interface-createjs.spec.js',
  'lib/_packaging/spec-footer'
];

// Copy EaselJS
gulp.task('copyEaselJS', function () {
  return gulp.src(['bower_components/EaselJS/lib/**']).pipe(gulp.dest('dist/EaselJS'));
});
// Copy PreloadJS
gulp.task('copyPreloadJS', function () {
  return gulp.src(['bower_components/PreloadJS/lib/**']).pipe(gulp.dest('dist/PreloadJS'));
});
// Copy SoundJS
gulp.task('copySoundJS', function () {
  return gulp.src(['bower_components/SoundJS/lib/**']).pipe(gulp.dest('dist/SoundJS'));
});
// Copy TweenJS
gulp.task('copyTweenJS', function () {
  return gulp.src(['bower_components/TweenJS/lib/**']).pipe(gulp.dest('dist/TweenJS'));
});


// Build Lib
gulp.task('_buildLib', function () {
  return gulp.src(libFiles)
    .pipe(concat('tgi-interface-createjs.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('tgi-interface-createjs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Build Spec
gulp.task('_buildSpec', function () {
  return gulp.src(specFiles)
    .pipe(concat('tgi-interface-createjs.spec.js'))
    .pipe(gulp.dest('dist'));
});

// Build Task
gulp.task('build', ['_buildLib', '_buildSpec'], function (callback) {
  callback();
});

// Lint Lib
gulp.task('_lintLib', ['_buildLib'], function (callback) {
  return gulp.src('dist/tgi.core.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Lint Spec
gulp.task('_lintSpec', ['_buildSpec'], function (callback) {
  return gulp.src('dist/tgi.core.spec.js')
    .pipe(jshint({validthis: true, sub: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Lint Task
gulp.task('lint', ['_lintLib', '_lintSpec'], function (callback) {
  callback();
});

// Test Task
gulp.task('test', ['lint'], function (callback) {
  childProcess.exec('node spec/node-runner.js', function (error, stdout, stderr) {
    console.log(stdout);
    callback(error);
  });
});

// Coverage Task
gulp.task('cover', function (callback) {
  childProcess.exec('istanbul cover spec/node-runner.js', function (error, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    callback(error);
  });
});

// Spec Task
gulp.task('spec', ['lint'], function (callback) {
  setTimeout(function () {
    childProcess.exec('node spec/node-make-spec-md.js', function (error, stdout, stderr) {
      console.log(stdout);
      callback(error);
    });
  }, 100); // Without this sometimes the exec runs before script is written/flushed ?
});

// Default & Travis CI Task
gulp.task('default', ['copyEaselJS', 'copyPreloadJS', 'copySoundJS', 'copyTweenJS', 'test']);
gulp.task('travis', ['test']);
