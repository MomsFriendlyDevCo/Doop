/**
* Nodemon gulp task
* Watch various file types firing off rebuild tasks as changes are detected
*
* @param {boolean} [process.env.WATCH_MODULES] If present the node_modules folder will also be watched for changes. This is extremely costly and should only be done when devloping in that directory
*/

var colors = require('chalk');
var domain = require('domain');
var gulp = require('gulp');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var watch = require('gulp-watch');

/**
* Launch a server and watch the local file system for changes (restarting the server if any are detected)
* This task independently watches the client side files dir (inc. Angular) for changes and only rebuilds those without rebooting the server if a change is detected
*/
gulp.task('nodemon', ['load:app', 'build'], function(finish) {

	var watchDomain = domain.create();

	watchDomain.on('error', function(err) {
		if (err.code == 'ENOSPC') {
			console.log(colors.red('GULP WARNING!'), 'ENOSPC thrown which usually means your iNotify limit is too low. See', colors.cyan('https://goo.gl/YvnogQ'), 'for details');
		} else {
			throw err;
		}
	});

	watchDomain.run(function() {
		var runCount = 0;
		var monitor = nodemon({
			script: paths.root + '/server.js',
			ext: 'js',
			ignore: [].concat(paths.ignore, paths.scripts, paths.css, paths.ngPartials), // Only watch server files - everything else is handled seperately anyway
		})
			.on('start', function() {
				if (runCount > 0) return;
				if (app.config.gulp.notifications)
					notify(Object.assign(app.config.gulp.notifySettings, {
						title: app.config.title + ' - Nodemon',
						message: 'Server started',
						icon: __dirname + '/icons/node.png',
					})).write(0);
			})
			.on('restart', function() {
				runCount++;
				if (app.config.gulp.notifications)
					notify(Object.assign(app.config.gulp.notifySettings, {
						title: app.config.title + ' - Nodemon',
						message: 'Server restart' + (++runCount > 1 ? ' #' + runCount : ''),
						icon: __dirname + '/icons/nodemon.png',
					})).write(0);
			});

		// Install secondary watches
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

		watch('package.json', function() {
			gutil.log('Check NPM installs...');
			gulp.start('npm:update');
		});

		if (process.env.WATCH_MODULES) {
			watch([
				`${app.config.paths.root}/node_modules/**/*.js`,
				`${app.config.paths.root}/node_modules/**/*.css`,
			], function() {
				gutil.log('Rebuild Vendors (due to node_modules)...');
				gulp.start('vendors');
			});
		}

		watch([
			`${app.config.paths.root}/units/pages/**/*.html`,
			`${app.config.paths.root}/units/layouts/**/*.html`,
		], function() {
			gutil.log('Rebuild pages / layouts...');
			monitor.emit('restart');
		});
	});
});
