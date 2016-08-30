app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});


/**
* API to handle user logout
* @fires session.logout
*/
app.post('/api/session/logout', app.middleware.ensure.login, function(req, res) {
	app.fire('session.logout', function() {}, req.user);
	req.logout();
	res.status(200).send({});
});
