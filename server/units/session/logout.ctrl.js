app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});


/**
* API to handle user logout
*/
app.post('/api/users/logout', app.middleware.ensure.login, function(req, res) {
	req.logout();
	res.status(200).send({});
});
