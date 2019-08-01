/**
* Nodemon gulp task
* Watch various file types firing off rebuild tasks as changes are detected
*/

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
		var isRestarting = false;
		var serverProcess;
		var bootServerProcess = ()=>
			Promise.resolve()
				.then(()=> new Promise((resolve, reject) => {
					if (!serverProcess) return resolve();

					isRestarting = true;
					console.log('Restarting server process', runCount++ > 0 ? `Restart #${runCount}` : '');
					serverProcess.kill()
					serverProcess.on('close', ()=> {
						resolve();
						isRestarting = false;
					});
				}))
				.then(()=> {
					console.log('Booting server process');
					serverProcess = spawn('node', [`${app.config.paths.root}/server/index.js`], {stdio: 'inherit'});
					serverProcess.on('close', code => {
						if (isRestarting) {
							console.log('Close but restarting', code);
							return;
						}
						console.log('Process exited with code', code);
						serverProcess = null;
						setTimeout(bootServerProcess);
					});
				});

		process.on('beforeExit', ()=> {
			console.log('Closing server process');
			serverProcess.kill()
		});
		// }}}

		// Frontend rebuild {{{
		watch([
			'**/*.css',
			'**/*.vue',
			'vendors/vue.*.js',
		], {
			ignored: ['dist/**/*', 'fonts*/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
		}).on('all', file => {
			gulp.log('Rebuild Vue files...');
			gulp.parallel('build.css', 'build.vue')();
		});
		// }}}

		// Backend rebuild (server process restart) {{{
		watch([
			'**/*.doop',
			'server/index.js',
			'layouts/**/*.html',
		], {
			ignored: ['build/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
		}).on('all', (e, path) => {
			gulp.log('Rebuild backend hook / layout / path files...');
			bootServerProcess();
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
			gulp.run('build.vue');
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
				gulp.run('build.vendors.main', bootServerProcess);
			});
		}

		if (app.config.gulp.watchVendors) {
			gulp.log('Watching vendors...');
			watch(require(`${app.config.paths.root}/vendors/vendors.js`).main, {
				ignoreInitial: true,
			}).on('all', ()=> {
				gulp.log('Vendors file has changed, Rebuild Vendors...');
				gulp.run('build.vendors.main');
			});
		}
		// }}}

		bootServerProcess();
	});
});
