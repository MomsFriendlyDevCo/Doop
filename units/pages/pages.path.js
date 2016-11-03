/**
* Pages controller
* Request handling for general app pages
*/

app.get('/', function(req, res) {
	res.render('units/pages/main', {
		theme: app.config.title,
	});
});
