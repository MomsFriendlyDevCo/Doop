app.register('preControllers', function(finish) {
	app.use(require('express-log-url'));

	finish();
});
