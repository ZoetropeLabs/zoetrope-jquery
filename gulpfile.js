var fs = require('fs'),
	gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	path = require('path'),
	concat = require('gulp-concat'),
	size = require('gulp-size'),
	debug = require('gulp-debug'),
	gzip = require("gulp-gzip"),
	changed = require('gulp-changed'),
	sh = require('execSync'),
	csso = require('gulp-csso'),
	base64 = require('gulp-base64'),
	wrap = require('gulp-wrap'),
	rename = require("gulp-rename"),
	gutil = require('gulp-util'),
	replace = require('gulp-batch-replace'),
	Q = require('q'),
	http = require('http'),
	ecstatic = require('ecstatic'),
	spawn = require('child_process').spawn,
	download = require('gulp-download'),
	convert = require('gulp-convert'),
	StringDecoder = require('string_decoder').StringDecoder,
	through = require('through2'),
	docco = require("gulp-docco"),
	gfi = require('gulp-file-insert'),
	exec = require('gulp-exec'),
	runSequence = require('run-sequence'),
	svg2png = require('gulp-rsvg'),
	imagemin = require('gulp-imagemin'),
	pngcrush = require('imagemin-pngcrush');


var port = '8888';

// Branch info - Jenkins does some funky detached HEAD stuff, but is kind enough to give
// us an environment variable, however, this is not set in a normal environment
var jenkins_branch = (process.env.GIT_BRANCH || '').replace('origin/', '');
var travis_branch = (process.env.TRAVIS_BRANCH || '');
var res = sh.exec('git rev-parse --abbrev-ref HEAD').stdout.trim();
var gitBranch = (travis_branch || jenkins_branch || res);
console.log("current branch: ", gitBranch);

var git_sha = sh.exec("git rev-parse HEAD").stdout.trim();

var paths = {
	widget: [
		'lib/jquery-cookie/jquery.cookie.js',
		'lib/UUID/Math.uuid.js',
		'lib/keen/dist/keen-tracker.js',
		'lib/detectmobilebrowser.js',
        'lib/jquery-debounce/jquery.debounce.js',
		'src/zoetrope.js',
	],
	gfi : {
		"/* languages.json */" : 'src/languages.json',
		"/* analytics.js */": 'src/analytics.js',
	},
	less: 'less/style.less',
	htc: 'less/backgroundsize.min.htc',
	testHTML: 'src/test.html',
	testHTMLFiles: ['src/testInline.html','src/testPopover.html'],
	docs:'docs/developer_docs.md',
	languageStringsCSV: 'https://docs.google.com/spreadsheets/d/1y5McuTIe4G7F0xKM6JPm6STRKOHxE1G2IkDMiSxSeKo/export?format=csv&id=1y5McuTIe4G7F0xKM6JPm6STRKOHxE1G2IkDMiSxSeKo&gid=52872048',
	mobileDetect: 'http://detectmobilebrowsers.com/download/jquery',
	dist: 'dist/' + gitBranch,
	keen: 'lib/keen',
	svgs: 'img/svg/*.svg'
};

var module_name = "zoetrope.jquery";

var cdns = {
	'v3-dev': 'd34tuy4jppw3dn.cloudfront.net',
	'master': 'd34tuy4jppw3dn.cloudfront.net',
	v1: 'd34tuy4jppw3dn.cloudfront.net'
};

var keenKeys = {
	project: {
		'v1': '53356fc8ce5e4322f7000000',
		'v3': '53356fc8ce5e4322f7000000',
		'v2-dev': '533151a900111c0925000022',
		'master': '533151a900111c0925000022',
		'v3-dev': '533151a900111c0925000022',
	},
	write: {
		'v1': 'b286b63be854ac9ff4a371d31fa7a918112f413ebd98e3032be129bac1906145e34cc519c9e5601888b331398aef830fae871b96013b721d1ea603625187ef6fa2242dc0eaadc0a1685cc6a45fcfefa135290e5cbf6e3b4c89d5fe544328e6c1893f437ffb041ae5f9d34e5792ea9c48',
		'v3': 'b286b63be854ac9ff4a371d31fa7a918112f413ebd98e3032be129bac1906145e34cc519c9e5601888b331398aef830fae871b96013b721d1ea603625187ef6fa2242dc0eaadc0a1685cc6a45fcfefa135290e5cbf6e3b4c89d5fe544328e6c1893f437ffb041ae5f9d34e5792ea9c48',
		'v2-dev': '7dfc9a13209610eecaa3217d40df89bb186f575c82fb3a75d6dbe4b770fc7939db131680b979caf0c1aa802177d7d8a6494366f388230cac0ac56d55567262c45442102aff66ae0cfdb785e96ffbb6cd9696e8913c7b3393ff9bf8834fc6d9449e3fa62061a03e181cdc4e653f0e255e',
		'master': '7dfc9a13209610eecaa3217d40df89bb186f575c82fb3a75d6dbe4b770fc7939db131680b979caf0c1aa802177d7d8a6494366f388230cac0ac56d55567262c45442102aff66ae0cfdb785e96ffbb6cd9696e8913c7b3393ff9bf8834fc6d9449e3fa62061a03e181cdc4e653f0e255e',
		'v3-dev': '7dfc9a13209610eecaa3217d40df89bb186f575c82fb3a75d6dbe4b770fc7939db131680b979caf0c1aa802177d7d8a6494366f388230cac0ac56d55567262c45442102aff66ae0cfdb785e96ffbb6cd9696e8913c7b3393ff9bf8834fc6d9449e3fa62061a03e181cdc4e653f0e255e',
	}
};

var replacements = [
	['{{branch}}', gitBranch],
	['{{cdn:url}}', cdns[gitBranch]],
	['{{cdn:base}}', '.'],
	['{{image-cdn:url}}', cdns.v1],
	['{{keen-project-id}}', keenKeys.project[gitBranch]],
	['{{keen-write-key}}', keenKeys.write[gitBranch]]
];

var exitCode = 0;

callfunction = function (options) {
	options = options || {};
	return through.obj(function (file, enc, cb) {
		cb();
	}, function (cb) {
		options.cb();
		cb();
	});
};

killserver = function (server) {
	return function () {
		server.close();
	};
};


spawnConcurrentProcess = function (child) {
	var stdout = '',
		stderr = '';

	var prom = Q.defer();

	child.stdout.setEncoding('utf8');

	child.stdout.on('data', function (data) {
		stdout += data;
		gutil.log(data);
	});

	child.stderr.setEncoding('utf8');
	child.stderr.on('data', function (data) {
		stderr += data;
		gutil.log(gutil.colors.red(data));
		gutil.beep();
	});

	child.on('exit', function(code) {
		if (child) {
			child.kill();
		}
		if (code) {
			gutil.log('protractor exited with code: ' + code);
			exitCode = code;
		}
		prom.resolve();
	});

	return prom.promise;
};

gulp.task('docs', function () {
	var options = {
		layout : 'linear',
	};

	return gulp.src(paths.docs)
		.pipe(docco(options))
		.pipe(gulp.dest('./docs'));
});

gulp.task('watch-docs', ['docs'], function (){
	gulp.watch(paths.docs, ['docs']);
});

gulp.task('less', ['htc'], function () {
	gulp.src(paths.less)
		.pipe(less({
			paths: [path.join(__dirname, 'less', 'includes')]
		}))
		.pipe(replace(replacements))
		.pipe(rename(module_name+'.css'))
		.pipe(base64({
			extensions: ['png', 'jpg', 'svg'],
			baseDir: paths.dist,
		})) // Embed the images in the CSS
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.dist + '/css'))
		.pipe(csso()) //Optimise the CSS
		.pipe(rename(module_name+'.min.css'))
		.pipe(size({
			showFiles: true
		}))
		.pipe(rename(module_name+'.min.css'))
		.pipe(gulp.dest(paths.dist + '/css'))
		.pipe(gzip())
		.pipe(size({
			showFiles: true
		}))
		.pipe(rename(module_name+'.min.css.gz'))
		.pipe(gulp.dest(paths.dist + '/css'));
});

gulp.task('htc', function () {
	gulp.src(paths.htc)
		.pipe(gulp.dest(paths.dist + '/css'));
});


var decoder = new StringDecoder('utf8');
/* Returns a function which picks the right string
	or the backup string, then trims it */
function getLangStringFunc(lang, defaultLang) {
	var getString = function (nameString) {
		var str = lang[nameString] || defaultLang[nameString];
		// return without whitespace
		return str.replace(/(^\s+|\s+$)/g, '');
	};
	return getString;
}

/* formats the json into our dictionary format. */
function makeLangugeObject(lang, defaultLang) {
	var getString = getLangStringFunc(lang, defaultLang);
	var output = {
		callToAction: {
			desktop: getString('click and drag image to rotate in 3D'),
			mobile: getString('swipe image to rotate in 3D'),
		},
		inlineCallToAction: {
			desktop: getString('Click to rotate'),
			mobile: getString('Tap to rotate'),
		},
		rotate: getString('Rotate'),
		elevate: getString('Elevate'),
		zoom: getString('Zoom'),
		changed: lang.Timestamp,
	};

	return output;
}

gulp.task('lang-strings', function () {
	var prom = Q.defer(),
		outputName = './src/languages.json',
		langColumn = '2 letter language Code', //language name column from form
		outputString = '';

	download(paths.languageStringsCSV)
		.pipe(convert({
			from: 'csv',
			to: 'json'
		}))
		.on('data', function (jsonString) {
			var languages = JSON.parse(decoder.write(jsonString.contents));
			languagesObj = {};

			for (var index in languages) {
				var lang = languages[index],
					defaultLang = languages[0];
				languageName = lang[langColumn].toLowerCase();
				languagesObj[languageName] = makeLangugeObject(lang, defaultLang);
			}

			//wrap JSON up as JS
			outputString = JSON.stringify(languagesObj, null, 4);
			fs.writeFile(outputName, outputString, function (err) {
				if (err) {
					gutil.error(err);
				} else {
					gutil.log("JSON saved to " + outputName);
				}
				prom.resolve(); // We're done when the file's written out
			});
		});
	return prom.promise;
});

gulp.task('detect-mobile', function(){
	var prom = Q.defer();

	download(paths.mobileDetect)
		.pipe(rename('detectmobilebrowser.js'))
		.pipe(gulp.dest('lib'))
		.on('end', function() {
			prom.resolve();
		});
	return prom.promise;
});

gulp.task('html', function () {
	 gulp.src(paths.testHTML)
	.pipe(replace(replacements))
	.pipe(rename('index.html'))
	.pipe(gulp.dest(paths.dist));
	 return gulp.src(paths.testHTMLFiles)
		 .pipe(replace(replacements))
		 .pipe(gulp.dest(paths.dist));
});

gulp.task('javascript', function () {

	var comment_preserve = function (node, comment) {
		return /Zoetrope Ltd/i.test(comment.value);
	};

	return gulp.src(paths.widget)
		.pipe(concat(module_name+'.js')) //merge sources in the order from the paths.widget array
		.pipe(wrap('/* COPYRIGHT Zoetrope Ltd 2014. Build: ' + git_sha + ' */\n!(function(){<%= contents %>})();')) //wrap in function to keep global NS clean
		.pipe(gfi(paths.gfi))
		.pipe(replace(replacements))
		.pipe(gulp.dest(paths.dist + '/js'))
		.pipe(uglify({
			compress: {
				drop_console: true
			},
			preserveComments: comment_preserve
		})) //the minified version drops all the console logging
		.pipe(rename(module_name+'.min.uncomp.js')) //Keep a dev version without gzipping
		.pipe(gulp.dest(paths.dist + '/js'))
		.pipe(gzip())
		.pipe(size({
			showFiles: true
		}))
		.pipe(rename(module_name+'.min.js.gz'))
		.pipe(gulp.dest(paths.dist + '/js'));
});

gulp.task('test', ['default'], function () {
	//set up http server
	var server = http.createServer(
		ecstatic({
			root: 'dist/'
		})
	).listen(port);
	console.log('Listening on : ' + port);

	gutil.log("Spawning protractor processes");
	var children = {};

	children.desktop = spawn(
		'protractor', ['desktopProtractor.conf.js']
	);
	children.mobile = spawn(
		'protractor', ['mobileProtractor.conf.js']
	);

	return Q.allSettled([spawnConcurrentProcess(children.mobile),
						spawnConcurrentProcess(children.desktop)])
		.spread(function(mob, desk) {
				gutil.log("Mobile Testing: ", mob.state === "fulfilled");
				gutil.log("Desktop Testing: ", desk.state === "fulfilled");
				gutil.log("Exit code: ", exitCode);
			})
		.then(function() {
			killserver(server);
			process.exit(exitCode);
		});

});

// Rerun the task when a file changes
gulp.task('watch', ['default'], function () {

	//set up http server
	http.createServer(
		ecstatic({
			root: 'dist/',
			showDir: true,
			autoIndex : true,
			cache : 0,
		})
	).listen(port);
	console.log('Listening on :' + port);

	var child = spawn(
		'xdg-open', ['http://localhost:' + port + '/' + gitBranch + '/index.html']
	);

	var stdout = '',
		stderr = '';

	child.stdout.setEncoding('utf8');

	child.stdout.on('data', function (data) {
		stdout += data;
		gutil.log(data);
	});

	child.stderr.setEncoding('utf8');
	child.stderr.on('data', function (data) {
		stderr += data;
		gutil.log(gutil.colors.red(data));
		gutil.beep();
	});

	//gulp watch tasks
	gulp.watch(paths.testHTML, ['html']);
	gulp.watch(paths.widget, ['javascript']);

	var gfi = [];
	for(var i in paths.gfi){
		gfi.push(paths.gfi[i]);
	}
	gulp.watch(gfi, ['javascript']);
	gulp.watch('less/*', ['less']);
	gulp.watch(paths.svgs, ['convert-images'])
});

gulp.task('build-keen', function() {
	var result = sh.exec('cd lib/keen; grunt');
	console.log(result.stderr);
	console.log(result.stdout);
});


gulp.task('convert-images', function(cb) {
	return gulp.src(paths.svgs)
		.pipe(svg2png())
		.pipe(imagemin({
			progressive:true,
			use:[pngcrush()]
		}))
		.pipe(gulp.dest(paths.dist + '/img'));
});

// Get some language strings etc
gulp.task('fetch', ['detect-mobile','lang-strings', 'build-keen']);

gulp.task('build-all', ['less', 'javascript', 'html', 'convert-images']);


// The default task (called when you run `gulp` from cli)
gulp.task('default', function() {
	runSequence('fetch', 'build-all');
});

var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
