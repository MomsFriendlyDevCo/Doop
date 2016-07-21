/**
 * API for active user profile data
 */
app.get('/api/session/profile', function(req, res) {
	if (!req.user) return res.status(200).send({});

	// Decide what gets exposed to the front-end
	var user = {
		_id: req.user._id,
		username: req.user.username,
		email: req.user.email,
		name: req.user.name,
		role: req.user.role,
		isAdmin: (req.user.role == 'admin' || req.user.role == 'root'),
		isRoot: (req.user.role == 'root'),
		settings: req.user.settings || null,
	};

	res.json(user);
});

/**
* Save the user profile
* @param object req.body.settings Settings object to save
*/
app.post('/api/session/profile', app.middleware.ensure.login, function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body || !_.isObject(req.body)) return next('Nothing to save');
			next();
		})
		// }}}
		.then(function(next) {
			_.merge(req.user, _.pick(req.body, ['settings']));
			req.user.save();
			next();
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.status(200).end();
		});
});

