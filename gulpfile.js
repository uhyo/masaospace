var path = require('path');
var util = require('util');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var source = require('vinyl-source-stream');
var uglifyComposer = require('gulp-uglify/composer');
var globule = require('globule');
var del = require('del');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var concat = require('gulp-concat');

const gulpTs = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');

// Uglifier
const uglify = uglifyComposer(require('uglify-es'), console);

// TypeScript projects
const clientTsProject = gulpTs.createProject('tsconfig-client.json');
const serverTsProject = gulpTs.createProject('tsconfig-server.json');

gulp.task('tsc-server', () => {
  return serverTsProject
    .src()
    .pipe(serverTsProject())
    .js.pipe(gulp.dest('dist-server/'));
});

gulp.task(
  'watch-tsc-server',
  gulp.series('tsc-server', () => {
    gulp.watch('src/**/*.ts', ['tsc-server']);
  }),
);

gulp.task('tsc-client', () => {
  return clientTsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(clientTsProject())
    .js.pipe(sourcemaps.write())
    .pipe(gulp.dest('dist-client/'));
});

gulp.task(
  'watch-tsc-client',
  gulp.series('tsc-client', () => {
    gulp.watch(['client/**/*.ts', 'client/**/*.tsx'], ['tsc-client']);
  }),
);

gulp.task('webpack', () => {
  return makeWebpack(false);
});

gulp.task('watch-webpack', () => {
  return makeWebpack(true);
});

gulp.task('mc_canvas-static', function() {
  return gulp
    .src('mc_canvas/Samples/*.gif')
    .pipe(changed('dist/'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('mc_canvas-uglify', function() {
  return gulp
    .src([
      'mc_canvas/Outputs/CanvasMasao.js',
      'mc_canvas/Outputs/CanvasMasao_v28.js',
      'mc_canvas/Outputs/MasaoKani2_manual.js',
      'mc_canvas/Extends/InputRecorder.js',
      'mc_canvas/Extends/InputPlayer.js',
    ])
    .pipe(changed('dist/'))
    .pipe(uglify())
    .pipe(
      gulpif(function(file) {
        return path.basename(file.path) === 'CanvasMasao_v28.js';
      }, replace('CanvasMasao', 'CanvasMasao_v28')),
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task(
  'mc_canvas',
  gulp.series('mc_canvas-static', 'mc_canvas-uglify', () => {
    return gulp
      .src([
        'dist/CanvasMasao.js',
        'dist/CanvasMasao_v28.js',
        'dist/MasaoKani2_manual.js',
        'dist/InputRecorder.js',
        'dist/InputPlayer.js',
      ])
      .pipe(concat('CanvasMasao.min.js'))
      .pipe(gulp.dest('dist/'));
  }),
);

gulp.task('static-image', function() {
  return gulp
    .src(['client/images/**/*'], {
      base: 'client/images',
    })
    .pipe(changed('dist/images/'))
    .pipe(gulp.dest('dist/images/'));
});

gulp.task('static-sound', function() {
  return gulp
    .src(['client/sounds/*'], {
      base: 'client/sounds',
    })
    .pipe(changed('dist/sounds/'))
    .pipe(gulp.dest('dist/sounds/'));
});

gulp.task('static', gulp.series('static-image', 'static-sound'));

gulp.task('css', function() {
  return gulp
    .src(['client/css/index.scss'])
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename('css.css'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function(cb) {
  del(
    [
      //tsc
      'dist-client',
      'dist-server',
      //jsx
      'dist',
    ],
    cb,
  );
});

gulp.task('batch-tsc', function() {
  return gulp
    .src('batch/**/*.ts')
    .pipe(gulpTs.createProject('tsconfig-server.json')())
    .js.pipe(gulp.dest('batch/'));
});

gulp.task(
  'watch',
  gulp.series(
    gulp.parallel(
      'watch-tsc-client',
      'watch-webpack',
      'css',
      'watch-tsc-server',
    ),
    function() {
      //w
      gulp.watch(['client/css/*.scss', 'masao-editor/css/*.scss'], ['css']);
    },
  ),
);

gulp.task('client', gulp.series('webpack', 'css'));
gulp.task(
  'default',
  gulp.series(
    'tsc-server',
    'css',
    'tsc-client',
    'webpack',
    'mc_canvas',
    'static',
    'batch-tsc',
  ),
);

// make
function makeWebpack(watch) {
  const compiler = webpack(require('./webpack.config.js'));

  const handleStats = (stats, watch) => {
    console.log(
      stats.toString({
        chunks: !watch,
        colors: true,
      }),
    );
  };
  if (watch) {
    return compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }
      handleStats(stats, true);
    });
  } else {
    return compiler.run((err, stats) => {
      if (err) {
        console.error(err);
        return;
      }
      handleStats(stats, false);
    });
  }
}
