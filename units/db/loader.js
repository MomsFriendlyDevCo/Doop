/**
* Actual worker to load database models into global.app.db + global.db
* This is seperated into its own un-oppinionated module so that it can be used by 'dumb' scripts without the need for the Doop framework load process
*
* @example
* // Access the database via a dumb module:
* var db = require(config.paths.root + '/units/db/loader')(function(db) { // db is now the modules loaded // })
*
* @exmaple
* // Access the database via an emitter
* require(config.paths.root + '/units/db/loader')()
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

	// Queue the actual work for the next execute cycle so we can return immediately (otherwise we cant return an emitter);
	setTimeout(function() {
		if (!app.config) throw new Error('Attempted to load database before app.config was provided!');

		self.emit('start');

		monoxide.connect(app.config.mongo.uri)
			.on('error', err => self.emit('error', err));

		self.emit('connected');

		glob(app.config.paths.root + '/units/**/*.schm.js', function(err, files) {
			if (err) return next(err);
			files.forEach(path => {
				self.emit('model', path);
				require(path);
			});

			self.emit('end', monoxide.models);
			if (_.isFunction(callback)) callback(null, monoxide.models);
		});
	});

	return self;
};
