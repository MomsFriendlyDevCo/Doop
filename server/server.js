#!/usr/bin/env node

/**
* App server bootstrapper and initialiser
*
* This file will configure, setup, and start the application server, pulling in
* all the required modules, controllers, services, etc. the app will need to run.
*/

// Requires {{{
var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var express = require('express');
var fs = require('fs');
var fspath = require('path');
var glob = require('glob');
// }}}

// Globals {{{
global.app = express();
app.config = require('./config/index.conf');
app.middleware = {};
// }}}

// Globals / app.register() + app.fire() {{{
/**
* Object holding all possible hooks that the framework fires
* See the documentation for the fire order
* Keys are listed in fire order
* @var {Object}
*/
global.app._registers = {};

/**
* Function used to hook into a framework emitter
* NOTE: The ID of the CURRENT item is taken from the unit name (stored against) `app.unit.id`
* NOTE: This function is *intentionally* name different from a regular NodeJS event emitter as it takes a callback for each registered function
* @param {string} hook The hook to wait for (corresponds with global.app._registers keys)
* @param {string|array} [prereqs] Optional single string or array of prerequisite services we should fire after
* @param {function} [callback] Optional callback to fire. Called as `(err, next)`
* @return {object} The app object
* @see app.fire()
*/
global.app.register = function(hook, prereqs, callback) {
	if (!_.has(global.app._registers, hook)) { // Not seen this type of hook before - create a base
		global.app._registers[hook] = async().limit(1);
	}

	// Argument mangling {{{
	if (_.isFunction(prereqs)) {
		callback = prereqs;
		prereqs = [];
	}
	// }}}

	var thisUnit = app.unit; // Store this so the closure doesn't change its value
	global.app._registers[hook].defer(prereqs, thisUnit.id, function(next) {
		console.log('-', colors.grey('[hook:' + hook + ']'), thisUnit.id);
		callback(next);
	});
	return global.app;
};

/**
* Execute a framework emitter
* This really just fires the async object and waits until everything is done
* NOTE: This function is *intentionally* name different from a regular NodeJS event emitter as it takes a callback for each registered function
* @param {string} hook The emitter to fire
* @param {function} [callback] Optional callback to fire on completion. Called as `(err)`
* @return {object} The app object
* @see app.register()
*/
global.app.fire = function(hook, callback) {
	if (!_.has(global.app._registers, hook)) return _.isFunction(callback) ? callback() : null; // Hook never registered - dont bother

	console.log('-', colors.grey('[fire]'), hook);

	global.app._registers[hook]
		.await()
		.end(callback);

	return global.app;
};
// }}}
// Globals app.getUnit() {{{
/**
* Populate an object with useful information from a file path within a unit
* @param {string} path The path to the component within a unit
* @return {Object} An object composed of various keys - see example below
*
* @example
* app.getUnit('/some/path/somewhere/units/fooBarBaz/fooBarBaz.modl.js');
* {
* 	id: 'fooBarBaz',
* 	shortName: 'fooBarBaz/fooBarBaz.modl.js',
* }
*/
app.getUnit = function(path) {
	var id = fspath.basename(fspath.dirname(path));
	return {
		id: id,
		shortName: id + '/' + fspath.basename(path),
	};
};
// }}}


async()
	// Initial boot
	.then(next => {
		console.log(colors.bold.blue('⚝  Doop! ⚝'));
		console.log('-', colors.grey('[env]'), colors.cyan(app.config.env));
		next();
	})
	// }}}
	// Load all services {{{
	.then(function(next) {
		glob(app.config.paths.server + '/units/**/*.serv.js', function(err, files) {
			if (err) return next(err);
			files.forEach(path => {
				app.unit = app.getUnit(path);
				console.log('-', colors.grey('[serv]'), app.unit.shortName);
				require(path);
			});
			next();
		});
	})
	// }}}
	// Fire 'init' (for very-early processes) {{{
	.then(next => app.fire('init', next))
	// }}}
	// Fire 'preControllers' {{{
	.then(next => app.fire('preControllers', next))
	// }}}
	// Load all controllers {{{
	.then(function(next) {
		glob(app.config.paths.server + '/units/**/*.ctrl.js', function(err, files) {
			if (err) return next(err);
			if (!files.length) return next('No server controllers found');
			files.forEach(path => {
				app.unit = app.getUnit(path);
				console.log('-', colors.grey('[ctrl]'), app.unit.shortName);
				require(path);
			});
			next();
		});
	})
	// }}}
	// Fire 'postControllers' {{{
	.then(next => app.fire('postControllers', next))
	// }}}
	// Fire 'preServer' {{{
	.then(next => app.fire('preServer', next))
	// }}}
	// Load the server and start listening {{{
	.then(next => global.app.server = app.listen(app.config.port, app.config.host, next))
	// }}}
	// Fire 'postServer' {{{
	.then(next => app.fire('postServer', next))
	// }}}
	// End {{{
	.end(function(err) {
		if (err) {
			console.log(colors.bold.red('Error loading core framework:'), err.toString());
		} else {
			console.log(colors.bold.green('Server boot complete'));
			console.log('Web interface listening at', colors.cyan(app.config.url));
		}
	});
	// }}}
