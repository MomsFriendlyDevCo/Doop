app.register('postServer', function(finish) {
	// Handle 404
	app.use(function(req, res) {
		res.format({
			text: function() {
				res.status(404).send('Page not found!');
			},

			html: function() {
				res.status(404).render('units/errors/404', {
					theme: app.config.theme,
				});
			},

			json: function() {
				res.status(404).send({ error: 'Page not found!' });
			}
		});
	});

	// Handle 500
	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.format({
			text: function() {
				res.status(500).send('Something went wrong!');
			},

			html: function() {
				res.status(500).render('units/errors/500', {
					theme: app.config.theme,
				});
			},

			json: function() {
				res.status(500).send({ error: 'Something went wrong!' });
			}
		});
	});

	finish();
});
