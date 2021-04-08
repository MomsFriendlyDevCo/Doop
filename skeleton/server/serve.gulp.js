/**
* Nodemon gulp task
* Watch various file types firing off rebuild tasks as changes are detected
*/

var _ = require('lodash');
var domain = require('domain');
var gulp = require('@momsfriendlydevco/gulpy'); // Force gulpy as regular gulp is weird when forced to run tasks out-of-sequence
var nodemon = require('nodemon');
var spawn = require('child_process').spawn;
var watch = require('chokidar').watch;
var throttleTimeout = 1000; // How long to wait before firing a rebuild again - prevents multiple file updates launching multiple rebuilds simultaneously
var throttleOptions = {leading: true, trailing: false};

var procRunningCount = 0;

/**
* Launch a server and watch the local file system for changes (restarting the server if any are detected)
* This task independently watches the client side files dir (inc. Angular) for changes and only rebuilds those without rebooting the server if a change is detected
*/
gulp.task('serve', ['load:app', 'build'], function(finish) {
	var watchDomain = domain.create();

	watchDomain.on('error', function(err) {
		if (err.code == 'ENOSPC') {
			app.log(app.log.colors.red('GULP WARNING!'), 'ENOSPC thrown which usually means your iNotify limit is too low. See', app.log.colors.cyan('https://goo.gl/YvnogQ'), 'for details');
		} else {
			throw err;
		}
	});

	watchDomain.run(()=> {
		// Server process (Nodemon instance) {{{
		var isQuitting = false;

		// Gulp manages file changes so specify an invalid extension so nodemon doesn't actually watch anything valid
		var serverProcess = nodemon(`--ext FAKEFILE '${app.config.paths.root}/server/index.js'`)
			.once('start', ()=> finish())
			.on('start', ()=> app.log(app.log.colors.bgGreen('FIXME:NODEMON'), 'start'))
			.on('crash', ()=> !isQuitting && app.log.warn(app.log.colors.bgGreen('FIXME:NODEMON'), 'Server has crashed'))
			.on('restart', files => app.log(app.log.colors.bgGreen('FIXME:NODEMON'), 'Server restarting', {files}))
			.on('exit', ()=> {
				if (!isQuitting && app.config.isProduction) {
					app.log.warn('Server exited cleanly - but its not supposed to ever exit, forcing restart');
					serverProcess.emit('restart');
				}
			})


		process.on('SIGINT', ()=> {
			gulp.log('Closing server process due to SIGTERM');
			process.exit(1);
		});

		process.on('beforeExit', ()=> {
			gulp.log('Closing server process');
			isQuitting = true;
			serverProcess.emit('quit');
		});
		// }}}

		// Frontend rebuild {{{
		watch([
			'**/*.vue'
		], {
			ignored: ['dist/**/*', 'data/**/*', 'fonts*/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
			awaitWriteFinish: true,
		}).on('all', _.throttle(file => {
			gulp.log('Rebuild Vue files...');
			gulp.run('build.vue');
		}, throttleTimeout, throttleOptions));
		// }}}

		// Backend rebuild (server process restart) {{{
		watch([
			'**/*.doop',
			'config/**/*',
			'sanity/*.js',
			'server/index.js',
			'layouts/**/*.html',
			...app.config.gulp.watchRestart,
		], {
			ignored: ['build/**/*', 'data/**/*', 'dist/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
		}).on('all', _.throttle((e, path) => {
			gulp.log('Rebuild backend hook / layout / path files...');
			serverProcess.emit('restart');
		}, throttleTimeout, throttleOptions));

		watch('package.json').on('change', ()=> {
			gulp.log('Check NPM installs...');
			gulp.run('npm.update');
		});

		watch([
			'config/*.conf.js',
			'services/config.vue',
		], {ignoreInitial: true}).on('all', _.throttle((e, path) => {
			gulp.log('Rebuild config service...');
			gulp.run('build.vue', ()=> serverProcess.emit('restart'));
		}, throttleTimeout, throttleOptions));

		if (app.config.gulp.watchModules) {
			gulp.log('Watching node_modules...');
			watch([
				`${app.config.paths.root}/node_modules/**/*`,
				...app.config.gulp.watchModulesInclude,
			], {
				ignoreInitial: true,
			}).on('all', _.throttle(()=> {
				gulp.log('Node_modules has changed, Rebuild Vendors...');
				gulp.run('build.vue', ()=> serverProcess.emit('restart'));
			}, throttleTimeout, throttleOptions));
		}

		if (app.config.gulp.watchVendors) {
			gulp.log('Watching vendors...');
			watch(require(`${app.config.paths.root}/vendors/vendors.js`).main, {
				ignoreInitial: true,
			}).on('all', _.throttle(()=> {
				gulp.log('Vendors file has changed, Rebuild Vendors...');
				gulp.run('build.vue', ()=> serverProcess.emit('restart'));
			}, throttleTimeout, throttleOptions));
		}
		// }}}
	});
});
