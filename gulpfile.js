/**
* Project gulpfile
*
* Globals required by gulp tasks should be defined in this file.
*/

var _ = require('lodash');
var glob = require('glob');
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var path = require('path');
var runSequence = require('run-sequence');
var taskListing = require('gulp-task-listing');

var port = process.env.PORT || 8080;

/**
* Gulp configuration
* global.config must be defined by invoking the 'load:config' gulp task
*/
// Configure / Paths {{{
// All paths should be relative to the project root directory
global.paths = {
	root: __dirname, // Root directory of the project
	ignore: [ // Do not monitor these paths for changes
		'node_modules',
		'build',
		'data',
		'test',
	],
	config: __dirname + '/config',
	html: ['units/**/*.tmpl.html', 'units/**/*.html'],
	ngPartials: 'units/**/*.tmpl.html',
	data: 'data',
	tests: 'tests',
	build: 'build',
	vendors: {
		// Vendor files
		// This list supports brace expansion so 'foo.{css,js}' ~> ['foo.css', 'foo.js']
		// Do not include minified files here! Minification happens automatically
		core: [
			// Core vendor dependencies - these should be as minimal as possible
			// Injected as a <script/> at the start of the <head/>
			'node_modules/@momsfriendlydevco/angular-ui-loader/dist/loader.{js,css}',
			'units/theme/loader.css',
		],
		main: [
			// Main vendor dependencies - these include pretty much everything else below-the-fold
			// Injected as a <script defer/> at the end of the <head/>
			// Dependencies maintain order so list pre-requisites first
			// --- critical dependency parent packages below this line --- //
			'node_modules/jquery/dist/jquery.js',
			'node_modules/lodash/lodash.js',
			'node_modules/angular/angular.js',
			'node_modules/moment/moment.js',
			'node_modules/tether/dist/js/tether.js',
			// --- packages with dependents below this line --- //
			// NOTE: Don't need main bootstrap.css as the theme provides this
			'node_modules/bootstrap/dist/js/bootstrap.js',
			// --- less important vendors below this line (alphabetical) --- //
			'node_modules/@momsfriendlydevco/animate/dist/animate.css',
			'node_modules/@momsfriendlydevco/angular-bs-tooltip/dist/angular-bs-tooltip.js',
			'node_modules/@momsfriendlydevco/angular-ui-loader/dist/ng-loader.js',
			'node_modules/@momsfriendlydevco/router/dist/angular-mfdc-router.js',
			'node_modules/angular-animate/angular-animate.js',
			'node_modules/angular-bs-confirm/angular-bs-confirm.js',
			'node_modules/angular-bs-popover/angular-bs-popover.js',
			'node_modules/angular-gravatar/build/angular-gravatar.js',
			'node_modules/angular-resource/angular-resource.js',
			'node_modules/angular-sanitize/angular-sanitize.js',
			'node_modules/angular-ui-notification/dist/angular-ui-notification.{css,js}',
			'node_modules/angular-ui-switch/angular-ui-switch.{css,js}',
			'node_modules/font-awesome/css/font-awesome.css',
			'node_modules/node-waves/dist/waves.css',
			'node_modules/node-waves/dist/waves.js',
			'node_modules/ui-select/dist/select.{css,js}',
		],
		docs: [ // Resources used by docs UI
		],
	},
	css: [
		'units/**/*.css',
	],
	scripts: [
		'units/core/frontend.js',
		'units/**/client.js',
		'units/**/client.conf.js',
		'units/**/*.modu.js',
		'units/**/*.serv.js',
		'units/**/*.dirv.js',
		'units/**/*.comp.js',
		'units/**/*.rout.js',
		'units/**/*.modl.js',
		'units/**/*.fltr.js',
		'units/**/*.ctrl.js',
	],
	specs: [
		'tests/client/specs/*.spec.js'
	],
	nodejs: [
		'units/**/*.hook.js',
		'units/**/*.path.js',
	],
	fonts: [
		// Add any specific font dependencies here
		'node_modules/font-awesome/fonts/**',
	],
	report: 'report',
	buildIncludes: [
		// Add any directories / files that also need to be included into the build directory
	],
	scenarios: {
		defaults: [
			'units/scenarios/defaults/**/*scenario.json'
		],
	}
};
// }}}

// Pull in gulp remaining gulp files (i.e. tasks)
glob.sync(__dirname + '/**/*.gulp.js').forEach(path => require(path));

/**
* List the available gulp tasks
*/
gulp.task('help', taskListing);

// Redirectors {{{
gulp.task('default', ['serve']);
gulp.task('clean', ['build:clean', 'scripts:clean']);
gulp.task('db', ['scenario']);
gulp.task('deploy', ['pm2-deploy']);
gulp.task('fakes', ['fake-users']);
gulp.task('serve', ['nodemon']);
gulp.task('start', ['pm2-start']);
gulp.on('stop', ()=> process.exit(0));
// }}}

// Loaders {{{

/**
* Loads main app configuration file into `app`
* This also includes loading `app.config`
* If you want `app.db` you must also call `load:app.db`
*/
gulp.task('load:app', [], function(finish) {
	require('./units/core/backend');
	global.config = app.config;

	finish();
});

/**
* Connects to the database and loads all models into `app.db` + `db`
*/
gulp.task('load:app.db', ['load:app'], function(finish) {
	// Load the app.middleware.logging.db middleware - needed by schemas to log their state
	_.set(app, 'middleware.logging.db', require(app.config.paths.root + '/units/middleware.logging.db/logging'));

	require(config.paths.root + '/units/db/loader')(function(err, models) {
		if (err) return finish(err);
		global.db = app.db = models;
		finish();
	});
});
// }}}

/**
* Launches a plain server without Nodemon
*/
gulp.task('server', ['build'], function() {
	require(paths.root + '/server.js');
});
// }}}
