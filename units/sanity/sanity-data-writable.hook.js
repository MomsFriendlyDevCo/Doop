/**
* Sanity Checker - Data dir writability
* Simple hook to alert if the data directory (`app.config.paths.data`) is not writable
*/

var _ = require('lodash');
var colors = require('chalk');
var fs = require('fs');

app.register('postServer', function(finish) {
	if (!app.config.sanity.writability) return finish();
	if (!_.get(app, 'config.paths.data')) return finish('Writability sanity checks are enabled but no config.paths.data is specified!');

	fs.access(app.config.paths.data, fs.constants.W_OK | fs.constants.X_OK, function(err) {
		if (err) {
			console.log(colors.blue('[Data]'), colors.red('WARNING'), 'Data directory', colors.cyan(app.config.paths.data), 'is not writable!');
		}
		finish();
	});
});
