/**
* Register static asset routes
*/

var express = require('express');

app.register('preServer', function(finish) {
	// NOTE: This ideally should NOT be enabled as we don't want to provide client with direct access to resources outside `/build`
	// app.use('/app', express.static(app.config.paths.root + '/client'));
	app.use('/build', express.static(app.config.paths.root + '/build'));
	app.use('/content', express.static(app.config.paths.root + '/build/content'));
	app.use('/data', express.static(app.config.paths.root + '/data'));

	finish();
});
