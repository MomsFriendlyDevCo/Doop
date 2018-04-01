var colors = require('chalk');
var logPrinter = require('express-log-url');

app.register('postServer', function(finish) {
	// Handle 404
	app.use(function(req, res) {
		res.format({
			text: function() {
				res.status(404).send('Page not found!');
			},

			html: function() {
				res.status(404).render('units/core.errors/404', {
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
		logPrinter(req, res, ()=> {});
		console.log(colors.grey(
			'--- error trace ('
			+ req.method
			+ ' '
			+ req.url
			+ (req.user ? ` user: ${req.user.username}` : '')
			+ ') ---'
		));
		console.error(err.stack);
		console.log(colors.grey('--- end of error ---'));

		res.format({
			text: function() {
				res.status(500).send('Something went wrong!');
			},

			html: function() {
				res.status(500).render('units/core.errors/500', {
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
