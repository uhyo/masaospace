var path=require('path');
var gulp=require('gulp');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var reactify=require('reactify');
var globule=require('globule');
var shell=require('gulp-shell');

var tscOptions = "--module commonjs --target es5";

gulp.task('tsc',function(){
    return gulp.src(["src/index.ts","src/api/*.ts"],{read:false})
    .pipe(shell([
        "node_modules/typescript/bin/tsc "+tscOptions+" --rootDir <%= rootdir %> --outDir <%= outdir %> <%= file.path %>"
    ],{
        templateData:{
            rootdir:path.join(__dirname,"src"),
            outdir:path.join(__dirname,"js")
        }
    }));
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
