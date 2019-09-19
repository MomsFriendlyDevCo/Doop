/**
* Nodemon gulp task
* Watch various file types firing off rebuild tasks as changes are detected
*/

var _ = require('lodash');
var domain = require('domain');
var gulp = require('gulp'); // Force gulpy as regular gulp is weird when forced to run tasks out-of-sequence
var spawn = require('child_process').spawn;
var watch = require('chokidar').watch;

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
		var runCount = 0;

		// Server process {{{
		var lastBoot;
		var isRunning = false;
		var isRestarting = false;
		var serverProcess;

		/**
		* Boot the server process in a seperate thread
		* @param {boolean} [forceRestart=false] If false the server is started if its not already, true force restarts
		* @returns {Promise} A promise representing the restart / server check status
		*/
		var bootServerProcess = (forceRestart = false) =>
			!forceRestart && isRunning // Only check and server is already running
				? Promise.resolve
				: Promise.resolve()
					.then(()=> new Promise((resolve, reject) => {
						if (!serverProcess) return resolve();

						isRestarting = true;
						gulp.log('Restarting server process', runCount++ > 0 ? `Restart #${runCount}` : '');
						serverProcess.kill()
						serverProcess.on('close', ()=> {
							resolve();
							isRestarting = false;
						});
					}))
					.then(()=> {
						gulp.log('Booting server process');
						lastBoot = Date.now();
						isRunning = true;
						serverProcess = spawn('node', [`${app.config.paths.root}/server/index.js`], {stdio: 'inherit'});
						serverProcess.on('close', code => {
							isRunning = false;
							if (isRestarting) {
								gulp.log('Server closed but is restarting', code);
								return;
							}
							gulp.log('Server process exited with error code', code);
							serverProcess = null;

							if (code != 0 && Date.now() - lastBoot < 3000) {
								gulp.log('Last reboot was only', gulp.colors.cyan(_.round((Date.now() - lastBoot) / 1000, 1) + 's'), 'ago. Waiting until a file changes...');
							} else {
								setTimeout(bootServerProcess, 1000);
							}
						});
					});

		process.on('beforeExit', ()=> {
			gulp.log('Closing server process');
			serverProcess.kill()
		});
		// }}}

		// Frontend rebuild {{{
		watch([
			'**/*.css',
			'**/*.vue',
			'vendors/vue.*.js',
		], {
			ignored: ['dist/**/*', 'data/**/*', 'fonts*/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
		}).on('all', file => {
			gulp.log('Rebuild Vue files...');
			gulp.run('build.css', 'build.vue', ()=> bootServerProcess(false));
		});
		// }}}

		// Backend rebuild (server process restart) {{{
		watch([
			'**/*.doop',
			'config/**/*',
			'server/index.js',
			'layouts/**/*.html',
		], {
			ignored: ['build/**/*', 'data/**/*', 'dist/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
		}).on('all', (e, path) => {
			gulp.log('Rebuild backend hook / layout / path files...');
			bootServerProcess(true);
		});

		watch('package.json').on('change', ()=> {
			gulp.log('Check NPM installs...');
			gulp.run('npm.update');
		});

		watch([
			'config/*.conf.js',
			'services/config.vue',
		], {ignoreInitial: true}).on('all', (e, path) => {
			gulp.log('Rebuild config service...');
			gulp.run('build.vue', ()=> bootServerProcess(false));
		});

		if (app.config.gulp.watchModules) {
			gulp.log('Watching node_modules...');
			watch([
				`${app.config.paths.root}/node_modules/**/*`,
				...app.config.gulp.watchModulesInclude,
			], {
				ignoreInitial: true,
			}).on('all', ()=> {
				gulp.log('Node_modules has changed, Rebuild Vendors...');
				gulp.run('build.vendors.main', ()=> bootServerProcess(true));
			});
		}

		if (app.config.gulp.watchVendors) {
			gulp.log('Watching vendors...');
			watch(require(`${app.config.paths.root}/vendors/vendors.js`).main, {
				ignoreInitial: true,
			}).on('all', ()=> {
				gulp.log('Vendors file has changed, Rebuild Vendors...');
				gulp.run('build.vendors.main', ()=> bootServerProcess(false));
			});
		}
		// }}}

		bootServerProcess(true);
	});
});
