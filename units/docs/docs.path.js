/**
* Documentation controller
*/
app.get('/docs', function(req, res) {
	res.render('units/docs/docs', {
		layout: app.config.paths.root + '/units/docs/layout.html',
		theme: app.config.theme,
	});
});
