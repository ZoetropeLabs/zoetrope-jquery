var gulp = require('gulp');
var http = require('http');
var ecstatic = require('ecstatic');

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