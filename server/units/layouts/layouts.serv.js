var ejs = require('ejs');
var express = require('express');
var layouts = require('express-ejs-layouts');

app.register('init', function(finish) {
	app.set('title', app.config.title);
	app.set('views', app.config.paths.server);
	app.set('view engine', 'html');
	app.set('layout', 'units/layouts/main');
	app.engine('.html', ejs.renderFile);
	app.enable('view cache');
	app.use(layouts);

	finish();
});

app.register('postControllers', function(finish) {
	app.use('/build', express.static(app.config.paths.server + '/build', {lastModified: 100 * 60 * 10}));

	finish();
});
