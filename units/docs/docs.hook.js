var colors = require('chalk');

app.register('postFinish', function(finish) {
	console.log('Documentation available at', colors.cyan(app.config.url + '/docs'));
	finish();
});
