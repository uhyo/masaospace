var path=require('path');
var gulp=require('gulp');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var reactify=require('reactify');
var globule=require('globule');
var typescript=require('gulp-typescript');

gulp.task('tsc',function(){
    return gulp.src("src/**/*.ts")
    .pipe(typescript({
        module:"commonjs",
        target:"es5",
        typescript:require('typescript')
    }))
    .js
    .pipe(gulp.dest("js/"));
});

gulp.task('jsx',function(){
    var files=globule.find("client/jsx/*.jsx").concat("client/entrypoint.jsx").map(function(p){
        return path.join(__dirname,p);
    });
    return browserify({
        entries:files,
        transform:[reactify],
        extensions:['.js','.jsx'],
        basedir:__dirname
    })
    .bundle()
    .pipe(source("components.js"))
    .pipe(gulp.dest("dist"))
    .pipe(gulp.dest("client/static"));
});

gulp.task('default',['tsc','jsx']);
