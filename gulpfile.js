var gulp = require('gulp');
var http = require('http');
var ecstatic = require('ecstatic');
var docco = require('gulp-docco');

//set up http server
gulp.task('watch', function(){
	http.createServer(
	    ecstatic({
	        root: '.',
	        autoIndex : true,
	        cache : 0.1,
	    })
	).listen(9000);
	gulp.watch('.', []);
});

gulp.task('docs', function () {
    var options = {
        layout : 'linear',
    };

    return gulp.src('./docs/developer_docs.md')
        .pipe(docco(options))
        .pipe(gulp.dest('./docs'));
});

gulp.task('watch-docs', ['docs', 'watch'], function (){
    gulp.watch(paths.docs, ['docs']);
});