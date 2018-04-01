var express = require('express');

app.register('postControllers', function(finish) {
	app.use('/fonts', app.middleware.extensions('eot', 'svg', 'ttf', 'woff', 'woff2'), express.static(app.config.paths.root + '/node_modules/font-awesome/fonts'));
	app.use('/fonts', app.middleware.extensions('eot', 'svg', 'ttf', 'woff', 'woff2'), express.static(__dirname));

	finish();
});