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
var debug = require('debug')('doop');
var express = require('express');
var fs = require('fs');
var fspath = require('path');
var glob = require('glob');
// }}}

// Globals {{{
global.app = express();
app.isServer = true;
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
		global.app._registers[hook] = [];
	}

	// Argument mangling {{{
	if (_.isFunction(prereqs)) {
		callback = prereqs;
		prereqs = [];
	}
	// }}}

	var attacher = app.getCaller();
	attacher.file = fspath.relative(app.config.paths.root, attacher.file);

	debug('Registered hook "' + hook + '"' + (_.isArray(prereqs) && prereqs.length ? ' (prereqs: ' + prereqs.join(', ') + ')' : '') + ' from ' + attacher.file);
	global.app._registers[hook].push({
		id: app.unit.id,
		prereqs: prereqs,
		callback: callback,
		attacher: attacher,
	});

	return global.app;
};

/**
* Execute a framework emitter
* This really just fires the async object and waits until everything is done
* NOTE: This function is *intentionally* name different from a regular NodeJS event emitter as it takes a callback for each registered function
* @param {string} hook The emitter to fire
* @param {function} [callback] Optional callback to fire on completion. Called as `(err)`
* @param {mixed,...} [param] Additional parameters to pass
* @return {object} The app object
* @see app.register()
*/
global.app.fire = function(hook, callback) {
	if (!_.has(global.app._registers, hook)) return _.isFunction(callback) ? callback() : null; // Hook never registered - dont bother

	debug('Fire hook', hook);

	// Work out arguments to pass to each task (func args minus first two, named vars)
	var callbackArgs = Array.prototype.slice.call(arguments, 0);
	callbackArgs.shift();
	callbackArgs.shift();

	// Construct async object to handle all hook items
	var handler = async();
	global.app._registers[hook].forEach(function(cb) {
		handler.defer(cb.prereqs, cb.id, function(next) {
			debug('[hook:' + hook + ', handler:' + cb.id + ']', cb.attacher.file);

			if (!debug.enabled) { // Not debugging just run the callback (fast)
				cb.callback.apply(this, [next].concat(callbackArgs));
			} else { // Run hook with debugging helpers (slow)
				cb.callback.apply(this, [function(err, val) {
					debug('[hook:' + hook + ', handler:' + cb.id + ']', cb.attacher.file, 'completed');

					setTimeout(function() { // Set into next cycle so async-chainable can mark the IDs as completed
						var waitingOn =_(handler._struct)
							.filter(s => s.waitingOn > 0)
							.map(s => s.waitingOnIds)
							.map(s => s + ' (' + cb.attacher.file + ')')
							.flatten()
							.value();

						if (waitingOn.length) debug('[hook:' + hook + ']', 'Waiting on:', waitingOn.join(', '));
						if (waitingOn[0] == 'middleware (units/db/db.hook.js)') debugger;
					});

					next(err, val);
				}].concat(callbackArgs));
			}
		});
	});

	// Execute handler
	handler
		.await()
		.then(function(next) {
			debug('Fire Hook Complete "' + hook + '"');
			next();
		})
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
* app.getUnit('/units/fooBarBaz/fooBarBaz.modl.js');
* {
* 	id: 'fooBarBaz',
* 	path: 'fooBarBaz/fooBarBaz.modl.js',
* }
*/
app.getUnit = function(path) {
	var relativePath = fspath.relative(app.config.paths.root + '/units', path);
	var id = relativePath.split(fspath.sep)[0];

	return {
		id: id,
		path: path,
	};
};
// }}}
// Globals - utility functions {{{
/**
* Recieve details about a functions caller
* This function works similar to `arguments` in that its local to its own caller function (i.e. you can only get details about the function that is calling it)
* @return {Object} An object with the keys: name (the function name, if any), file, line, char
*/
app.getCaller = function() {
	var err = new Error()
	var stack = err.stack.split(/\n+/);
	stack.shift(); // getCaller()
	stack.shift(); // this functions caller
	stack.shift();

	var bits = /^\s+at (.+?) \((.+?):([0-9]+?):([0-9]+?)\)$/.exec(stack[0]);

	return {
		name: bits[1],
		file: bits[2],
		line: bits[3],
		char: bits[4],
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
		glob(app.config.paths.root + '/units/**/*.hook.js', function(err, files) {
			if (err) return next(err);
			var loaded = [];
			files.forEach(path => {
				app.unit = app.getUnit(path);
				loaded.push(app.unit);
				require(path);
			});
			console.log('-', colors.grey('[hook]'), loaded.map(l => colors.cyan(l.id)).join(', '));
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
	// Load all route path handlers {{{
	.then(function(next) {
		glob(app.config.paths.root + '/units/**/*.path.js', function(err, files) {
			if (err) return next(err);
			if (!files.length) return next('No server controllers found');
			var loaded = [];
			files.forEach(path => {
				app.unit = app.getUnit(path);
				loaded.push(app.unit);
				require(path);
			});
			if (debug.enabled) debug('Loaded paths', loaded.map(l => colors.cyan(l.id)).join(', '));
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
	// Attempt to load the app server and start listening {{{
	.then(function(next) {
		app.fire('preHTTPServer', function(err) {
			if (err) {
				console.log(colors.bold.yellow('Refusing to boot app HTTP server:', err.toString()));
				return next();
			}

			// Start HTTP app server
			if (!global.app.server) {
				// Create a server only if nothing else has created one
				debug('Skipping HTTP server setup as some other unit has already done that');
				global.app.server = app.listen(app.config.port, app.config.host, next);
			} else {
				return next();
			}
		});
	})
	// }}}
	// Fire 'postServer' {{{
	.then(next => app.fire('postServer', next))
	// }}}
	// Show status messages {{{
	.then(function(next) {
		console.log(colors.bold.green('Server boot complete'));
		console.log('Web interface listening at', colors.cyan(app.config.url));
		next();
	})
	// }}}
	// Fire 'postFinish' {{{
	.then(next => app.fire('postFinish', next))
	// }}}
	// End {{{
	.end(function(err) {
		if (err) return console.log(colors.bold.red('Error loading core framework:'), err.toString());
	});
	// }}}