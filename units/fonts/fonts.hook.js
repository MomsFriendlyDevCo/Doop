var express = require('express');

app.register('postControllers', function(finish) {
	app.use('/fonts', app.middleware.extensions('eot', 'svg', 'ttf', 'woff', 'woff2'), express.static(__dirname, {fallthrough: true}));

	finish();
});
