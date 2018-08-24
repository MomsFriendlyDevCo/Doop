/**
* Actual worker to load database models into global.app.db + global.db
* This is seperated into its own un-oppinionated module so that it can be used by 'dumb' scripts without the need for the Doop framework load process
*
* @example
* // Access the database via a dumb module:
* var db = require(config.paths.root + '/units/core.db/loader')(function(db) { // db is now the modules loaded // })
*
* @exmaple
* // Access the database via an emitter
* require(config.paths.root + '/units/core.db/loader')()
* 	.on('end', (models) => { // Models is now the modules loaded // });
*/

var _ = require('lodash');
var async = require('async-chainable');
var glob = require('glob');
var events = require('events');
var monoxide = require('monoxide');

/**
* Load the database and all models
* @param {function} callback Optional callback to fire on exit. Called as (err, models)
* @return {EventEmitter}
*/
module.exports = function databaseLoader(callback) {
	var self = new events.EventEmitter();
	self.emit('start');

	async()
		// Setup plugins + emitter bindings {{{
		.then(function(next) {
			monoxide.use(app.config.mongo.plugins, next)
		})
		// }}}
		.parallel({
			// Attempt to connect {{{
			connection: function(next) {
				try {
					monoxide.connect(app.config.mongo.uri, next);
				} catch (err) {
					next(err);
				}
			},
			// }}}
			// Fetch list of schema files {{{
			schemas: function(next) {
				glob(`${app.config.paths.root}/units/**/*.schm.js`, next);
			},
			// }}}
		})
		// Load schemas {{{
		.forEach('schemas', function(next, path) {
			try {
				self.emit('model', path);
				require(path);
				next();
			} catch (err) {
				next(err);
			}
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) {
				self.emit('error', err);
				if (callback) callback(err);
			} else {
				self.emit('end', monoxide.models);
				self.emit('connected');
				if (callback) callback(null, monoxide.models);
			}
		});
		// }}}

	return self;
};
