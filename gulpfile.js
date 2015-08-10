var path=require('path');
var gulp=require('gulp');
var gulputil=require('gulp-util');
var duration=require('gulp-duration');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var reactify=require('reactify');
var babelify=require('babelify');
var uglifyify=require('uglifyify');
var watchify=require('watchify');
var uglify=require('gulp-uglify');
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
    return jsxCompiler(false);
});

gulp.task('watch-jsx',function(){
    return jsxCompiler(true);
});

gulp.task("mc_canvas-static",function(){
    return gulp.src("mc_canvas/Samples/*.gif")
    .pipe(changed("dist/"))
    .pipe(gulp.dest("dist/"));
});

gulp.task('mc_canvas',["mc_canvas-static"],function(){
    return gulp.src(["mc_canvas/Outputs/CanvasMasao.js","mc_canvas/Outputs/CanvasMasao_v28.js"])
    .pipe(changed("dist/"))
    .pipe(uglify())
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

gulp.task('watch',['watch-jsx','css','tsc'],function(){
    //w
    gulp.watch("client/css/*.scss",['css']);
    gulp.watch("src/**/*.ts",['tsc']);
});

gulp.task('client',['jsx','css']);
gulp.task('default',['tsc','jsx','css','mc_canvas','static']);

//jsx compiling
function jsxCompiler(watch){
    //init browserify bundler
    var opts={
        entries:[path.join(__dirname,"client/entrypoint.jsx")],
        extensions:[".js",".jsx"],
        basedir:__dirname
    };
    if(watch){
        opts.cache={};
        opts.packageCache={};
        opts.fullPaths=true;
    }
    var b=browserify(opts);
    if(watch){
        b=watchify(b);
    }
    //chain
    b.transform(babelify)
    .transform(reactify)
    .transform(uglifyify,{global:true});

    b.on('update',bundle);
    bundle();
    return b;

    function bundle(){
        gulputil.log('recompiling jsx');

        b
        .bundle()
        .on('error',function(err){
            console.error(err);
        })
        .pipe(duration("compiled jsx"))
        .pipe(source("components.js"))
        .pipe(gulp.dest("dist/"));
    }
}
