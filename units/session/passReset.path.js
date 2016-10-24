var email = require('mfdc-email');
var isValidEmail = require('is-valid-email');
var uuid = require('node-uuid');

/**
* Resets user password given the email of the user
*/
app.route('/action/resetpass')
	.get(function(req, res) {
		res.render('units/session/resetPass');
	})
	.post(function(req, res) {
		async()
			.then(function(next) {
				// Sanity checking
				if (!req.body.email) return next('No email specified!');
				if (!isValidEmail(req.body.email)) return next('Invalid email address');
				next();
			})
			.then('user', function(next) {
				// Find user by email
				db.users.findOne({ email: req.body.email }, function(err, user) {
					if (err) return next(err);
					if (!user) return next('User with that email does not exist');

					// Add reset token to user account
					user.token = uuid.v4();
					user.save(next);
				});
			})
			.then(function(next) {
				// Dispatch reset password email with reset token link
				email
					// FIXME
					.to(req.body.email)
					.subject('Signup')
					.template(app.config.paths.server + '/units/users/resetPass.email.html')
					.templateParams({
						// Construct the link the user will need to activate to verify their account and thus complete signup
						tokenURI: app.config.url + '/action/resetpass/' + this.user.token
					})
					.send(next);
			})
			.end(function(err) {
				if (err) return res.status(400).send({ err: err });

				res.send({ status: 'success', message: 'Password reset email sent', email: req.body.email });
			});
	});

/**
* Serve the password reset page
*/
app.get('/action/resetpass/:token', function(req, res) {
	if (!req.params.token) return res.redirect('/');

	res.render('core/users/resetpass');
});

/**
* Process password reset request
*/
app.route('/api/users/resetpass')
	.post(function(req, res) {
		async()
			// Sanity checks {{{
			.then(function(next) {
				if (!req.body.token) return next('No token specified');
				if (!req.body.password) return next('New password not specified');
				next();
			})
			// }}}
			// Fetch user by token {{{
			.then('user', function(next) {
				// Find user by token
				db.users.findOne({ token: req.body.token }, function(err, user) {
					if (err) return next(err);
					if (!user) return next('Could validate token: no users match the provided token');
					next(null, user);
				});
			})
			// }}}
			// Set password + reset token {{{
			.then(function(next) {
				user.token = undefined;
				user.password = req.body.password;
				user.save(next);
			})
			// }}}
			// End {{{
			.end(function(err) {
				if (err) return res.status(400).send({ err: err });

				res.send({ status: 'success', message: 'Password reset', email: req.body.email });
			})
			// }}}
	});
