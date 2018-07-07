var express = require('express');

app.register('postControllers', function(finish) {
	app.config.page.headInject.push('<link href="/build/vendors-fonts.min.css" rel="stylesheet"type="text/css"/>');

	app.use('/webfonts', app.middleware.extensions('eot', 'svg', 'ttf', 'woff', 'woff2'), express.static(`${app.config.paths.root}/units/fonts.fa5/fa-pro/webfonts`, {fallthrough: true}));

	finish();
});
