var path=require('path');
var gulp=require('gulp');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var reactify=require('reactify');
var babelify=require('babelify');
var globule=require('globule');
var typescript=require('gulp-typescript');
var del=require('del');
var changed=require('gulp-changed');
var sass=require('gulp-sass');
var rename=require('gulp-rename');

gulp.task('tsc',function(){
    return gulp.src("src/**/*.ts")
    .pipe(changed("js/"))
    .pipe(typescript({
        module:"commonjs",
        target:"es5",
        typescript:require('typescript')
    }))
    .js
    .pipe(gulp.dest("js/"));
});

gulp.task('jsx',function(){
    return browserify({
        entries:[path.join(__dirname,"client/entrypoint.jsx")],
        transform:[babelify,reactify],
        extensions:['.js','.jsx'],
        basedir:__dirname
    })
    .bundle()
    .pipe(source("components.js"))
    .pipe(gulp.dest("dist/"));
});

gulp.task('mc_canvas',function(){
    return gulp.src(["mc_canvas/Outputs/CanvasMasao.js","mc_canvas/Samples/*.gif"])
    .pipe(changed("dist/"))
    .pipe(gulp.dest("dist/"));
});

gulp.task('static',function(){
    return gulp.src(["client/images/**/*"],{
        base:"client/images"
    })
    .pipe(changed("dist/images/"))
    .pipe(gulp.dest("dist/images/"));
});

gulp.task('css',function(){
    return gulp.src(["client/css/index.scss"])
    .pipe(sass({outputStyle:"compressed"}))
    .pipe(rename("css.css"))
    .pipe(gulp.dest("dist/"));
});

gulp.task('clean',function(cb){
    del([
        //tsc
        "js",
        "src/**/*.js",
        //jsx
        "dist",
    ],cb);
});

gulp.task('client',['jsx','css']);
gulp.task('default',['tsc','jsx','css','mc_canvas','static']);
