/**
* Doop compatible wrapper for the `index.js` script
* This is so that the index script can be used by dumb processes while this one is Doop framework aware
*/
var colors = require('chalk');

var databaseLoader = require('.');

app.register('preControllers', function(finish) {
	
	app.fire('preModels');

	databaseLoader()
		.on('start', () => console.log('-', colors.grey('[db]'), 'Connecting to', colors.cyan(app.config.mongo.uri)))
		.on('error', err => finish('DB CONNECTION ERR: ' + err.toString()))
		.on('model', path => {
			app.unit = app.getUnit(path);
			console.log('-', colors.grey('[modl]'), app.unit.shortName);
		})
		.on('end', models => {
			app.fire('postModels');
			app.db = global.db = models; // Setup global shortcut to models
			finish();
		});
});
