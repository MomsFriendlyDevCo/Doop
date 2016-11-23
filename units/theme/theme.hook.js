var express = require('express');

app.register('preServer', function(finish) {
	app.use('/theme', app.middleware.extensions('jpg', 'png'), express.static(__dirname));

	finish();
});
