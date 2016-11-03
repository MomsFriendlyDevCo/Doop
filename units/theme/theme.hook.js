var express = require('express');

app.register('preServer', function(finish) {
	app.use('/theme', express.static(__dirname, {extensions: ['jpg', 'png']}));

	finish();
});
