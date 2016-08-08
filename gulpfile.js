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
		'server/build',
		'data',
		'test',
		'client/app', // No need to watch this with nodemon as its handled seperately
	],
	client: __dirname + '/client',
	config: __dirname + '/server/config',
	server: __dirname + '/server',
	html: ['client/**/*.html', 'server/**/*.html'],
	ngPartials: 'client/app/**/*.html',
	data: 'data',
	tests: 'tests',
	build: 'server/build',
	vendors: {
		// Vendor files
		// This list supports brace expansion so 'foo.{css,js}' ~> ['foo.css', 'foo.js']
		// Do not include minified files here! Minification happens automatically
		core: [
			// Core vendor dependencies - these should be as minimal as possible
			// Injected as a <script/> at the start of the <head/>
			// 'node_modules/angular-ui-loader/dist/loader.{js,css}',
			// 'lib/vendor-core/loader.css',
		],
		main: [
			// Main vendor dependencies - these include pretty much everything else below-the-fold
			// Injected as a <script defer/> at the end of the <head/>
			// Dependencies maintain order so list pre-requisites first
			// --- critical dependency parent packages below this line --- //
			'node_modules/jquery/dist/jquery.js',
			'node_modules/angular/angular.js',
			'node_modules/lodash/lodash.js',
			'node_modules/moment/moment.js',
			// --- packages with dependents below this line --- //
			// 'node_modules/tether/dist/js/tether.js',
			// --- less important vendors below this line (alphabetical) --- //
			'node_modules/angular-ui-router/release/angular-ui-router.js',
			'node_modules/angular-resource/angular-resource.js',
			'node_modules/font-awesome/css/font-awesome.css',
		],
	},
	css: [
		'client/app/**/*.css',
	],
	scripts: [
		'client/app/app.mod.js',
		'client/app/app.conf.js',
		'client/app/**/*.mod.js',
		'client/app/**/*.js',
	],
	specs: [
		'tests/client/specs/*.spec.js'
	],
	nodejs: [
		'server/**/*.js'
	],
	fonts: [
		// Add any specific font dependencies here
		// FIXME: angular-ui-grid issue not identifying / using fonts/ folder
		// 'node_modules/angular-ui-grid/ui-grid.eot',
		// 'node_modules/angular-ui-grid/ui-grid.svg',
		// 'node_modules/angular-ui-grid/ui-grid.ttf',
		// 'node_modules/angular-ui-grid/ui-grid.woff',
		'node_modules/font-awesome/fonts/**',
	],
	images: [
		'client/content/images/**/*'
	],
	videos: [
		'client/content/videos/**/*'
	],
	report: 'report',
	buildIncludes: [
		// Add any directories / files that also need to be included into the build directory
		'node_modules/semantic-ui-css/**/themes/**/*.*',
		'node_modules/angular-ui-grid/ui-grid.eot',
		'node_modules/angular-ui-grid/ui-grid.svg',
		'node_modules/angular-ui-grid/ui-grid.ttf',
		'node_modules/angular-ui-grid/ui-grid.woff',
	],
	scenarios: {
		defaults: [
			'server/scenarios/defaults/**/*scenario.json'
		],
	}
};
// }}}

/**
* Use project's common gulp utils lib
*/
var common = require('./gulp/common.gulp.lib');

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
gulp.on('stop', function() { process.exit(0); });
// }}}

// Loaders {{{

/**
* Loads main app configuration file
*/
gulp.task('load:config', [], function(finish) {
	// Make a stub app object so the units can register themselves correctly {{{
	global.app = {
		quiet: true,
		config: require(paths.config + '/index.conf'),
	};
	// }}}
	global.config = app.config;

	finish();
});

/**
* Connects to the database and loads all models into `db`
*/
gulp.task('load:db', ['load:config'], function(finish) {
	require(config.paths.server + '/units/db/index')(models => {
		global.db = models;
		finish();
	});
});
// }}}

/**
* Launches a plain server without Nodemon
*/
gulp.task('server', ['build'], function() {
	require(paths.server + '/server.js');
});
// }}}
