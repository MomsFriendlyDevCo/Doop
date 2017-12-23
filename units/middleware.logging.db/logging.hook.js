/**
* Creates the app.middleware.logging.db item
* See the ./logging.js library for more details
*
* NOTE: The models to log are specified in app.config.logging.collections
*/

var async = require('async-chainable');
var colors = require('chalk');


var _ = require('lodash');

app.register('init', function(finish) {
	if (!app.middleware.logging) app.middleware.logging = {};

	app.middleware.logging.db = require('./logging');

	finish();
});


app.register('postModels', function(finish) {
	if (!app.config.logging.enabled) {
		console.log(colors.grey('[middleware.logging]'), 'logging disabled');
		return finish();
	}

	async()
		.forEach(app.config.logging.collections, function(nextModel, model) {
			app.db[model].use(app.middleware.logging.db.setup, nextModel);
		})
		.then(function(next) {
			console.log(colors.grey('[middleware.logging]'), 'Attached to:', app.config.logging.collections.map(i => colors.cyan(i)).join(', '));
			next();
		})
		.end(finish);
});