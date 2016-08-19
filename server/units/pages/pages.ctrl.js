/**
* Pages controller
* Request handling for general app pages
*/

/**
* Serves app root page
*/
app.get('/', function(req, res) {
	// If user is logged in show dashboard, otherwise show landing/home page
	if (req.user && req.user._id) {
		res.render('units/pages/main');
	} else {
		res.render('units/pages/promo', { layout: 'units/layouts/promo' });
	}
});

app.get('/tc', function(req, res) {
	res.render('units/pages/legal/tc');
});

app.get('/privacy', function(req, res) {
	res.render('units/pages/legal/privacy');
});
