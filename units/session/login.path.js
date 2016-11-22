/**
* User login controller
* All session-related routes are handled here.
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var passport = require('passport');

/**
* Serve the login page
*/
app.get('/login', app.middleware.ensure.nologin, function(req, res) {
	// Already logged in
	if (_.get(req, 'user._id')) return res.redirect('/');

	res.redirect('/#/login');
});


/**
* Attempt login sequence with given login credentials - legacy FORM/POST method
* @param {string} req.body.username The username to login with
* @param {string} req.body.password The password to login with
*/
app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}), function(req, res){
	if (req.user._token){
		// User requested password reset but logs in with current password
		req.user.save({_token: undefined}, function(err, doc) {
			res.redirect('/');
		});
	} else {
		res.redirect('/');
	}
});


/**
* Attempt login sequence with given login credentials - AJAX internal API based method
* @fires session.login
*/
app.post('/api/session/login', function(req, res) {
	async()
		.then(function(next) {
			// Mangle incomming details to trim data + lowercase username
			// These are mainly to be nice to people on mobile with weird predictive keyboards
			req.body.username = _.trim(req.body.username.toLowerCase());
			req.body.password = _.trim(req.body.password);
			next();
		})
		.then('profile', function(next) {
			passport.authenticate('local', function(err, user, info) {
				if (err) return next(err);
				if (user) {
					console.log(colors.green('Successful login for'), colors.cyan(req.body.username));
					app.fire('session.login', function(err) {
						req.logIn(user, function(err) {
							if (err) return next(err);
							next();
						});
					}, user);
				} else {
					console.log(colors.red('Failed login for'), colors.cyan(req.body.username));
					next('Unauthorized');
				}
			})(req, res, next);
		})
		.end(function(err) {
			if (err) return res.status(400).send({error: 'Invalid username or password'});
			res.redirect('/api/session/profile');
		});
});
