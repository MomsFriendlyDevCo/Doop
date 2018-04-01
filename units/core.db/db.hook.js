/**
* Doop compatible wrapper for the `index.js` script
* This is so that the index script can be used by dumb processes while this one is Doop framework aware
*/
var _ = require('lodash');
var colors = require('chalk');

var databaseLoader = require('./loader');

app.register('preControllers', function(finish) {
	_.merge(app, {dbSettings: {
		hooks: true, // Enable high level hooks for DOOP interfaces
	}});

	app.fire('preModels');

	databaseLoader()
		.on('start', () => console.log('-', colors.grey('[db]'), 'Connecting to', colors.cyan(app.config.mongo.uri)))
		.on('error', err => finish('DB CONNECTION ERR: ' + err.toString()))
		.on('model', path => {
			app.unit = app.getUnit(path);
		})
		.on('end', models => {
			app.fire('postModels');
			console.log('-', colors.grey('[schm]'), _.keys(models).map(i => colors.cyan(i)).join(', '));
			app.db = global.db = models; // Setup global shortcut to models

			finish();
		});
});
