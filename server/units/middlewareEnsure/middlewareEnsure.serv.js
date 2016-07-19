var colors = require('chalk');

app.register('preControllers', ['session'], function(finish) {
	app.middleware.ensure = {
		authFail: function(req, res, next) {
			console.log(colors.red('UNAUTHORIZED'), colors.cyan(req.url));

			res.format({
				'application/json': function() {
					res.status(401).send({err: "Unauthorized"}).end();
				},
				'default': function() {
					res.redirect('/');
				},
			});
		},

		/**
		 * Special handler to reject login and redirect to login screen or raise error depending on context
		 */
		loginFail: function(req, res, next) {
			console.log(colors.red('DENIED'), colors.cyan(req.url));

			// Failed login - decide how to return
			res.format({
				'application/json': function() {
					res.status(401).send({err: "Not logged in"}).end();
				},
				'default': function() {
					res.redirect('/login');
				},
			});
		},

		/**
		 * Verifies user is logged in
		 */
		login: function(req, res, next) {
			if (req.user && req.user._id) { // Check standard passport auth (inc. cookies)
				return next();
			} else if (req.body.token) { // Token has been provided
				Users.findOne({
					'auth.tokens.token': req.body.token
				}, function(err, user) {
					if (err || !user) return service.loginFail(req, res, next);
					console.log('Accepted auth token', colors.cyan(req.body.token));
					req.user = user;
					next();
				});
			} else { // Not logged in and no method being passed to handle - reject
				service.loginFail(req, res, next);
			}
		},

		/**
		 * Verifies user is not logged in and redirects if they are
		 */
		nologin: function(req, res, next) {
			if (req.user) {
				return res.redirect('/');
			} else {
				next();
			}
		},

		/**
		 * Verifies the user is an admin or not
		 */
		admin: function(req, res, next) {
			if (req.user && req.user._id && (req.user.role == 'admin' || req.user.role == 'root')) {
				return next();
			} else {
				authFail(req, res, next);
			}
		},

		/**
		 * Verifies the user has access to premium features or not
		 */
		premium: function(req, res, next) {
			if (
				req.user &&
				req.user._id &&
				(
					(req.user.role == 'admin' || req.user.role == 'root')
					||
					(req.user.role == "user" && (req.user._auth.subscription.type == 'premium' || req.user._auth.subscription.type == 'trial'))
				)
			) {
				return next();
			} else {
				return res.redirect('/');
			}
		},
	};

	finish();
});
