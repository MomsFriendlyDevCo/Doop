/**
* Register static asset routes
*/

var express = require('express');

app.register('preServer', function(finish) {
	app.use('/app', express.static(app.config.paths.root + '/client/app'));
	app.use('/build', express.static(app.config.paths.server + '/build'));
	app.use('/content', express.static(app.config.paths.server + '/build/content'));
	app.use('/data', express.static(app.config.paths.root + '/data'));
	app.use('/fonts', express.static(app.config.paths.server + '/build/fonts'));

	finish();
});
