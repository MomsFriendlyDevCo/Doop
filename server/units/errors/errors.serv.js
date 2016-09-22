app.register('postServer', function(finish) {
	// Handle 404
	app.use(function(req, res) {
		res.status(404).render('units/errors/404');
	});

	// Handle 500
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.status(500).render('units/errors/500');
	});

	finish();
});
