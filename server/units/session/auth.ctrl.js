/**
* User auth controller
* All auth-related routes are handled here.
* Actions like login should be part of a session unit.
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var email = require('mfdc-email');
var passport = require('passport');
var uuid = require('node-uuid');

app.route('/auth/facebook')
	.get(passport.authenticate('facebook'));

app.route('/auth/facebook/callback')
	.get(
		passport.authenticate('facebook', { failureRedirect: '/login' }),
		function(req, res) { res.redirect('/'); }
	);

app.route('/auth/google')
	.get(passport.authenticate('google'));

app.route('/auth/google/callback')
	.get(
		passport.authenticate('google', { failureRedirect: '/login '}),
		function(req, res) { res.redirect('/'); }
	);

/**
* Validate the given token to complete a user's signup
*/
app.route('/validate/:token')
	.get(function(req, res) {
		async()
			.then(function(next) {
				// Sanity checks {{{
				if (!req.params.token) return next('No token provided');
				next();
				// }}}
			})
			.then('user', function(next) {
				db.users.findOne({ token: req.params.token }, function(err, user) {
					if (err && err != 'Not found') return next(err);
					if (!user || err == 'Not found') return next('Could not validate token: no users match the provided token');

					// First time activation should set a user account status of pendingInfo
					user.status = 'pendingInfo';
					// Remove the token from the user account
					user.token = undefined;

					// User account begins with a 30 day trial subscription
					user._auth.subscription.type = 'trial';
					user._auth.subscription.expiry = moment().add(30, 'days').set('hour', 0).set('minute', 0).set('second', 0).toDate();

					user.save(next);
				});
			})
			.then(function(next) {
				// Send signup notifications to user now that the account is activated
				utils.notifications.add({
					type: 'account',
					user: this.user._id,
					content: "Welcome to 4ME Training!\nYour account has been given a free 1 month premium trial subscription.\nPlease ensure to upgrade to a premium subscription before your trial expires in order to keep your premium access to the site.\nThanks for join 4ME Training!"
				});
				next();
			})
			.end(function(err) {
				if (err) return res.status(400).send({ error: err });

				// Redirect to the login page on success
				res.redirect('/login/#/?verify=success');
			});
	});

// Password reset {{{

/**
* Resets user password given the email of the user
*/
app.route('/action/resetpass')
	.get(function(req, res) {
		res.render('units/users/resetpass');
	})
	.post(function(req, res) {
		async()
			.then(function(next) {
				// Sanity checking
				if (!req.body.email) return next('No email specified!');
				if (!/^(.*)@(.*)$/.test(req.body.email)) return next('Invalid email address'); // FIXME: Use proper validator
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
					.to(req.body.email)
					.subject('4ME Training: Reset Account Password')
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
* Serves password reset page
*/
app.get('/action/resetpass/:token', function(req, res) {
	if (!req.params.token) return res.redirect('/');

	res.render('core/users/resetpass');
});

/**
* Processes password reset request
*/
app.route('/api/users/resetpass')
	.post(function(req, res) {
		async()
			.then(function(next) {
				// Sanity checks
				if (!req.body.token) return next('No token specified');
				if (!req.body.password) return next('New password not specified');
				next();
			})
			.then('user', function(next) {
				// Find user by token
				db.users.findOne({ token: req.body.token }, function(err, user) {
					if (err) return next(err);
					if (!user) return next('Could validate token: no users match the provided token');

					// Update account with new password and remove token
					user.token = undefined;
					user.password = req.body.password;
					user.save(next);
				});
			})
			.end(function(err) {
				if (err) return res.status(400).send({ err: err });

				res.send({ status: 'success', message: 'Password reset', email: req.body.email });
			})
	});
// }}}
