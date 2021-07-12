/**
* Loads a very basic version of the Doop framework for the backend
* This file grantees the following items will exist:
*
*	- global.app
*	- global.app.config
*
* It is the upstream modules job to fire the event handlers to run a full server - e.g. server/index.js
* This file is designed to be a stand alone which loads everything - but does not execute it
*
* @example Load a Doop stack
* var app = require('doop') // Basic app object
* app.load() // Read in all `.doop` files and setup the event emitter
*/
var _ = require('lodash');
var babelRegister = require('@babel/register');
var colors = require('chalk');
var crash = require('@momsfriendlydevco/crash');
var debug = require('debug')('doop');
var dumper = require('dumper.js');
var fs = require('fs');
var fspath = require('path');
var url = require('url');

// Setup global `app` object {{{
global.app = {
	config: {}, // Loaded in next step
	db: {}, // DB stub - gets populate when the driver is loaded

	logger: console, // Console output stub, replaced by Winston or something else later

	// Stub structures which get populated out by event handlers later
	middleware: {
		business: {},
		express: {},
		db: {},
	},

	refresh: {
		log() {
			app.log = function(...msg) {
				if (this.id || app.log.forceId) {
					console.log.apply(this, [app.log.colors.blue(`[${this.id || app.log.forceId}]`)].concat(msg));
				} else {
					console.log.apply(this, msg);
				}
			};

			app.log.as = (as, ...msg) => console.log.apply(app, [app.log.colors.blue(`[${as}]`)].concat(msg));
			app.log.colors = colors;
			app.log.debug = (...msg) => debug.apply(app, msg);
			app.dump = app.log.dump = (...args) => args.forEach(a => dumper.dump(a));
			app.log.log = app.log;
			app.log.log.as = (as, ...msg) => console.log.apply(app, [app.log.colors.blue(`[${as}]`)].concat(msg));
			app.log.trace = (...msg) => console.trace.apply(app, [app.log.colors.blue(`[${this.id || app.log.forceId}]`)].concat(msg));
			app.log.trace.as = (as, ...msg) => console.trace.apply(app, [app.log.colors.blue(`[${as}]`)].concat(msg));
			app.log.warn = (...msg) => console.log.apply(app, [app.log.colors.blue(`[${this.id || app.log.forceId}]`), colors.yellow('[WARNING]')].concat(msg));
			app.log.warn.as = (as, ...msg) => console.log.apply(app, [app.log.colors.blue(`[${as}]`), colors.yellow('[WARNING]')].concat(msg));
			app.log.error = e => crash.trace(e);
			app.log.errorStop = e => crash.stop(e);


			/**
			* Wrap a function so that is properly uses the correct module ID
			* This is only really useful either early in the bootstrap process or for external modules where the ID cannot be correctly determined
			* @param {string} id The ID of the module to use as a prefix when logging
			* @param {function} func The function to wrap
			* @returns {function} The wrapped function
			*/
			app.log.wrap = (id, func) => (...args)=> {
				var oldId = app.log.forceId;
				app.log.forceId = id;
				var res = func(...args);
				app.log.forceId = oldId;
				return res;
			};
		},
	},

	utils: {},

	/**
	* Try to load a specifc config profile, if none is supplied use process.env.NODE_ENV
	* @param {string} [profile] Optional profile to load over regular config, if non supplied use process.env.NODE_ENV files are loaded in order with each overwriting the config output
	* @returns {Object} The new config object
	*/
	configLoad(profile) {
		var program = {};
		if (!profile && !process.env.DOOP_IGNORE_CMD_ARGS) {
			// Load command line arguments {{{
			program = require('commander');
			require('commander-extras');
			program
				.version(require('../package.json').version)
				.usage('[-e env]')
				.option('-e, --environment <env>', 'Set the envionment to use')
				.option('-o, --opt <key=val>', 'Set a config option by its dotted path', (v, total) => {
					var bits = [key, val] = v.split(/\s*=\s*/, 2);
					if (bits.length == 1) { // Assume we are just setting a flag to true
						_.set(total, key, true);
					}  else if (bits.length == 2) { // Assume key=val
						_.set(total, key, // Set the key, accepting various shorthand boolean values
							val === 'true' ? true
							: val === 'false' ? false
							: isFinite(val) ? +val
							: val
						);
					} else {
						throw `Failed to parse setting "${v}"`;
					}
					return total
				}, {})
				.option('--merge-config <env>', 'Merge a CSV of other config profiles over the base config')
				.env('DOOP_IGNORE_CMD_ARGS', 'If truthy no further processing is done on extra command arguments such as `-e [env]` or `o [opt=val]`')
				.parse(process.argv);
			// }}}
		}

		if (profile) {
			if (app.env) {
				app.log('Replacing config ENV', app.log.colors.cyan(app.env), 'with', app.log.colors.cyan(profile));
			} else {
				app.log('ENV', app.log.colors.cyan.bold(app.env));
			}
			app.env = process.env.NODE_ENV = profile;
		} else if (program.environment) {
			app.env = program.environment;
			app.log('ENV', app.log.colors.cyan.bold(app.env), app.log.colors.grey('(from CLI)'));
		} else if (process.env.NODE_ENV) {
			app.env = process.env.NODE_ENV;
			app.log('ENV', app.log.colors.cyan.bold(app.env), app.log.colors.grey('(from NODE_ENV)'));
		} else {
			app.env = 'dev';
			app.log('ENV', app.log.colors.cyan.bold(app.env), app.log.colors.grey('(no NODE_ENV, using default)'));
		}

		// Load initial config {{{
		app.config = require('../config');
		if (fs.existsSync(`${__dirname}/../config/private.js`)) {
			_.merge(app.config, require(`${__dirname}/../config/private.js`));
		} else {
			app.log.warn('ENV private config file', app.log.colors.cyan(fspath.resolve(`${__dirname}/../config/private.js`)), 'not found');
		}

		if (fs.existsSync(`${__dirname}/../config/${app.env}.js`)) {
			_.merge(app.config, require(`${__dirname}/../config/${app.env}.js`));
		} else if (app.env == 'dev') {
			app.log('Using base', app.log.colors.cyan('DEV'), 'config environment');
		} else {
			app.log.warn('ENV config file', app.log.colors.cyan(fspath.resolve(`${__dirname}/../config/${app.env}.js`)), 'not found');
		}
		// }}}
		// Flatten all functions into values (i.e. resolve them into what they should be to support recursion) {{{
		app.config = _.cloneDeepWith(app.config, node =>
			_.isFunction(node) ? node(app.config) : undefined // Eval functions, Let Lodash handle the rest
		);
		// }}}
		// If NODE_ENV_CONFIG exists process it as a CSV of dotted config values to override local {{{
		/**
		* The following config types are supported:
		* 	- KEY=VAL - set KEY (dotted notation) to VAL
		* 	- KEY - set KEY (again dotted) to true
		*/
		if (process.env.NODE_ENV_CONFIG) {
			app.log('Accepting config from NODE_ENV_CONFIG');
			process.env.NODE_ENV_CONFIG.split(/\s*,\s*/).forEach(tuple => {
				var match;
				if (match = /^(.+?)=(.*)$/.exec(tuple)) {
					app.log('Set config', app.log.colors.bold.cyan(match[1]), '=', app.log.colors.cyan(match[2]));
					_.set(app.config, match[1], match[2]);
				} else {
					app.log('Set config', app.log.colors.bold.cyan(tuple), '=', app.log.colors.cyan('TRUE'));
					_.set(app.config, tuple, true);
				}
			});
		}
		// }}}
		// If CLI provided overrides - merge them {{{
		_.merge(app.config, program.opt);
		// }}}
		// If config.url doesn't contain a port append it {{{
		if (app.config.port != 80 && url.parse(app.config.url).port != app.config.port) {
			var parsedURL = url.parse(app.config.url);
			parsedURL.host = undefined; // Have to set this to undef to force a hostname rebuild
			parsedURL.port = app.config.port;
			app.config.url = url.format(parsedURL);
		}
		// }}}
		// Trim remaining '/' from url {{{
		app.config.url = _.trimEnd(app.config.url, '/');
		// }}}
		// Calculate config.publicUrl - same as config.url with port forced to 80 {{{
		var parsedURL = url.parse(app.config.url);
		parsedURL.host = undefined; // Have to set this to undef to force a hostname rebuild
		parsedURL.port = undefined; // Have to set this to reset the port to default (80 doesn't work for some reason)
		app.config.publicUrl = _.trimEnd(url.format(parsedURL), '/');
		// }}}
	},
};
// }}}
// Setup initial logging (likely to be called again later or overridden) {{{
app.refresh.log(console);
// }}}
// Bootstrap {{{
app.configLoad = app.log.wrap('config', app.configLoad);
// }}}
// Load app.config {{{
app.configLoad();
// }}}
// Prepare for early Mongo load {{{
_.set(app, 'config.mongo.hooks', false); // Disable Mongo hooks until the full app boots
// }}}
// Setup unhandled promise method {{{
process.on('unhandledRejection', e => crash.trace(e, {prefix: 'Unhandled promise rejection'}));
// }}}
// Return a function which will load everthing async {{{
app.setup = require('./app.backend.setup');
// }}}
// Return basic app object
module.exports = app;

// Register all .mjs files for transpile
babelRegister({
	extensions: ['.mjs'],
});
