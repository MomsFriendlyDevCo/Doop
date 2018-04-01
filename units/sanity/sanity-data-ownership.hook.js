/**
* Sanity Checker - Data dir ownership
* Checks all files in the data directory recursively and reowns the files as the process UID if they are not already
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var fs = require('fs');
var glob = require('glob');

app.register('postServer', function(finish) {
	if (!app.config.sanity.ownership) return finish();
	if (!_.get(app, 'config.paths.data')) return finish('Writability sanity checks are enabled but no config.paths.data is specified!');

	console.log('-', colors.grey('[Sanity]', 'Checking file ownership...'));
	glob(`${app.config.paths.data}/**/*`, (err, files) => {
		if (err) return finish(err);
		async()
			.set('fixed', 0)
			.set('uid', process.getuid())
			.forEach(files, function(next, file) {
				fs.stat(file, (err, stat) => {
					if (err) return next(err);
					if (stat.uid != this.uid) {
						fs.chown(file, this.uid, stat.gid, err => {
							if (err) {
								console.log('-', colors.grey('[Sanity]'), colors.red('WARNING'), 'Failed to set ownership UID', colors.cyan(this.uid), 'on file', colors.cyan(file));
							} else {
								this.fixed++;
							}
							next();
						});
					} else {
						next();
					}
				});
			})
			.then(function(next) {
				console.log('-', colors.grey('[Sanity]', 'Checked', files.length, 'files for ownership permissions'));
				if (this.fixed) console.log('-', colors.grey('[Sanity]'), 'Fixed', this.fixed, 'file ownership permissions');
				next();
			})
			.end(finish);
	});
});
