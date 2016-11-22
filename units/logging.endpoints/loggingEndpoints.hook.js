var _ = require('lodash');
var colors = require('chalk');
var expressEndpoints = require('express-list-endpoints');
var stringSort = require('string-sort');

app.register('postServer', function(finish) {
	console.log(colors.bold.green('- API endpoints'));

	_(expressEndpoints(app))
		.map(ep => ep.methods.map(m => [m, ep.path]))
		.flatten()
		.thru(ep => stringSort.sortBy(ep, 1, {charOrder: '/abcdefghijklmnopqrstuvwxyz0123456789:-_'}))
		.forEach(function(ep) {
			console.log(
				'-',
				(
					ep[0] == 'GET' ? colors.yellow('GET   ')
					: ep[0] == 'POST' ? colors.green('POST  ')
					: ep[0] == 'DELETE' ? colors.red('DELETE')
					: ep[0] == 'PUT' ? colors.cyan('PUT   ')
					: colors.red(_.padEnd(ep[0], 6, ' '))
				),
				ep[1]
			);
		});

	finish();
});
