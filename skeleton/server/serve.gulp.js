/**
* Nodemon gulp task
* Watch various file types firing off rebuild tasks as changes are detected
*/

const _ = require('lodash');
const domain = require('domain');
const nodemon = require('nodemon');
const spawn = require('child_process').spawn;
const watch = require('chokidar').watch;

const gulp = require('gulp');

var throttleTimeout = 1000; // How long to wait before firing a rebuild again - prevents multiple file updates launching multiple rebuilds simultaneously
var throttleOptions = {leading: true, trailing: false};

// FIXME: Unused variable?
var procRunningCount = 0;

/**
* Launch a server and watch the local file system for changes (restarting the server if any are detected)
* This task independently watches the client side files dir (inc. Angular) for changes and only rebuilds those without rebooting the server if a change is detected
*/
gulp.task('serve', ['load:app', 'build'], function(finish) {
	// FIXME: "domain" deprecation
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
			//.on('start', ()=> app.log(app.log.colors.bgGreen('FIXME:NODEMON'), 'start'))
			.on('crash', ()=> !isQuitting && app.log.warn(app.log.colors.bgGreen('FIXME:NODEMON'), 'Server has crashed'))
			//.on('restart', files => app.log(app.log.colors.bgGreen('FIXME:NODEMON'), 'Server restarting', {files}))
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
		// NOTE: This is handled automatically by Webpack / webpack-{dev,hot}-middleware in Express
		var restartWebpack = _.throttle(()=> {
			gulp.log('Rebuilding Webpack entry points...');
			app.webpack.watcher.invalidate();
		}, throttleTimeout, throttleOptions);

		watch([
			'**/*.vue',
		], {
			ignored: ['build/**/*', 'data/**/*', 'dist/**/*', 'node_modules/**/*'],
			ignoreInitial: true,
		}).on('add', path => {
			gulp.log('New file detected:', path);
			restartWebpack();
		}).on('unlink', path => {
			gulp.log('File removed:', path);
			restartWebpack();
		});
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
		}).on('all', ()=> {
			gulp.log('Rebuild backend hook / layout / path files...');
			serverProcess.emit('restart');
		});

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
