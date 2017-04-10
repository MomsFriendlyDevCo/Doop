/**
* Install a postControllers hook to glob for all template files (`*.tmpl.html`) and serve them via a regular GET request
*/

var express = require('express');
var glob = require('glob');

app.register('postControllers', function(finish) {
	glob(app.config.paths.root + '/units/**/*.tmpl.html', function(err, templates) {
		if (err) return finish('Unable to glob partial files - ' + err.toString());
		templates
			.map(t => t.substr((app.config.paths.root + '/units/').length))
			.forEach(t => app.get('/' + t, (req, res) => res.sendFile(app.config.paths.root + '/units/' + t)))

		finish();
	});
});
