var _ = require('lodash');
var colors = require('chalk');

app.register('preControllers', ['session'], function(finish) {
	_.merge(app.middleware, {ensure: {
		authFail: function(req, res, next) {
			console.log(colors.red('UNAUTHORIZED'), colors.cyan(req.url));

			res.format({
				'application/json': function() {
					res.sendError(403, 'Unauthorized');
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
					res.sendError(403, 'Not logged in');
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
			} else { // Not logged in and no method being passed to handle - reject
				app.middleware.ensure.loginFail(req, res, next);
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
				app.middleware.ensure.authFail(req, res, next);
			}
		},

		/**
		 * Verifies the user is root
		 */
		root: function(req, res, next) {
			if (req.user && req.user._id && req.user.role == 'root') {
				return next();
			} else {
				app.middleware.ensure.authFail(req, res, next);
			}
		},
	}});

	finish();
});