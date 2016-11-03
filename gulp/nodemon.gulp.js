/**
* nodemon gulp tasks
*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');

var common = require('./common.gulp.lib');

/**
* Launch a server and watch the local file system for changes (restarting the server if any are detected)
* This task independently watches the client side files dir (inc. Angular) for changes and only rebuilds those without rebooting the server if a change is detected
*/
gulp.task('nodemon', ['load:app', 'build'], function(finish) {
	watch(paths.scripts, function() {
		gutil.log('Rebuild client-side JS files...');
		gulp.start('scripts');
	});

	watch(paths.css, function() {
		gutil.log('Rebuild client-side CSS files...');
		gulp.start('css');
	});

	watch(paths.ngPartials, function() {
		gutil.log('Rebuild Angular partials...');
		gulp.start('partials');
	});

	watch('gulpfile.js', function() {
		gutil.log('Rebuild Vendors...');
		gulp.start('vendors');
	});

	var runCount = 0;
	nodemon({
		script: paths.root + '/server.js',
		ext: 'js ejs',
		ignore: [].concat(paths.ignore, paths.scripts, paths.css, paths.ngPartials), // Only watch server files - everything else is handled seperately anyway
	})
		.on('start', function() {
			if (runCount > 0) return;
			notify({
				title: app.config.title + ' - Nodemon',
				message: 'Server started',
				icon: __dirname + '/icons/node.png',
			}).write(0);
		})
		.on('restart', function() {
			runCount++;
			notify({
				title: app.config.title + ' - Nodemon',
				message: 'Server restart' + (++runCount > 1 ? ' #' + runCount : ''),
				icon: __dirname + '/icons/nodemon.png',
			}).write(0);
		});
});
