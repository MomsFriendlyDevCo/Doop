var express = require('express');

app.register('preServer', function(finish) {
	app.use('/fonts', express.static(app.config.paths.root + '/node_modules/font-awesome/fonts', {extensions: ['eot', 'svg', 'ttf', 'woff', 'woff2']}));
	app.use('/fonts', express.static(__dirname, {extensions: ['eot', 'svg', 'ttf', 'woff', 'woff2']}));

	finish();
});
