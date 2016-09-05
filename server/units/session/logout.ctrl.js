/**
* Attempt logout sequence - legacy FORM/POST method
*/
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});


/**
* Attempt logout sequence - AJAX internal API based method
* @fires session.logout
*/
app.post('/api/session/logout', app.middleware.ensure.login, function(req, res) {
	app.fire('session.logout', function() {}, req.user);
	req.logout();
	res.status(200).send({});
});
