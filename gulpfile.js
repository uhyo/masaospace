var gulp=require('gulp');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var reactify=require('reactify');
var globule=require('globule');

gulp.task('jsx',function(){
    return browserify({
        entries:globule.find("client/jsx/*.jsx"),
        transform:[reactify]
    })
    .bundle()
    .pipe(source("components.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task('default',['jsx']);
