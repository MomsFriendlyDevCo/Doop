/**
* Tasks for deploying and managing pm2 server instances of the app
*/

var _ = require('lodash');
var async = require('async-chainable');
var asyncExec = require('async-chainable-exec');
var colors = require('chalk');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fspath = require('path');
var pm2 = require('pm2');

/**
* Either install an initial (production level) instance or restart one if there is one already
*/
gulp.task('pm2-deploy', ['load:app'], function(finish) {
	async()
		// Sub-process config {{{
		.use(asyncExec)
		.execDefaults(app.config.execDefaults || {stdio: 'inherit'})
		// }}}

		// External execs required to refresh project {{{
		.exec('git pull')
		.exec('npm install --ignore-scripts')
		.exec('gulp build')
		// }}}

		// (Re)Deploy PM2 {{{
		.then('pm2', function(next) {
			pm2.connect(next);
		})
		.then('pm2List', function(next) {
			pm2.list(next);
		})
		.then(function(next) {
			var proc = _.find(this.pm2List, {name: app.config.name});

			if (proc) {
				gutil.log('Found existing PM2 process', colors.cyan(app.config.name), 'rebooting it');
				pm2.restart(app.config.name, function(err) {
					if (err) return next(err);
					gutil.log(colors.yellow('⟲'), 'PM2 process rebooted');
					next();
				});
			} else {
				gutil.log('No PM2 process named', colors.cyan(app.config.name), 'found. Booting for first time');
				pm2.start({name: app.config.name, script: paths.root + '/server.js'}, function(err) {
					// Deal with use case where the user has booted the process without a name {{{
					if (err == 'Error: Script already launched') {
						gutil.log('PM2 process already exists but without a name. Rebooting + renaming');
						async()
							.then(function(next) {
								pm2.stop('server.js', next);
							})
							.then(function(next) {
								pm2.start({name: app.config.name, script: paths.root + '/server.js'}, next);
							})
							.end(next);
					} else if (err) {
						next(err);
					} else {
						gutil.log(colors.green('✔'), 'PM2 process started');
						next();
					}
					// }}}
				});
			}
		})
		// }}}

		.end(finish);
});

gulp.task('pm2-start', ['load:app'], function(finish) {
	async()
		.then('pm2', function(next) {
			pm2.connect(next);
		})
		.then('pm2List', function(next) {
			pm2.list(next);
		})
		.then(function(next) {
			var proc = _.find(this.pm2List, {name: app.config.name});

			if (proc) {
				gutil.log('Found existing PM2 process', colors.cyan(app.config.name), 'rebooting it');
				pm2.restart(app.config.name, function(err) {
					if (err) return next(err);
					gutil.log(colors.yellow('⟲'), 'PM2 process rebooted');
					next();
				});
			} else {
				gutil.log('No PM2 process named', colors.cyan(app.config.name), 'found. Booting for first time');
				pm2.start({name: app.config.name, script: paths.root + '/server.js'}, function(err) {
					// Deal with use case where the user has booted the process without a name {{{
					if (err == 'Error: Script already launched') {
						gutil.log('PM2 process already exists but without a name. Rebooting + renaming');
						async()
							.then(function(next) {
								pm2.stop('server.js', next);
							})
							.then(function(next) {
								pm2.start({name: app.config.name, script: paths.root + '/server.js'}, next);
							})
							.end(next);
					} else if (err) {
						next(err);
					} else {
						gutil.log(colors.green('✔'), 'PM2 process started');
						next();
					}
					// }}}
				});
			}
		})
		.end(finish);
});
