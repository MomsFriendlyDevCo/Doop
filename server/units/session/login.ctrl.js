/**
* User login controller
* All session-related routes are handled here.
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var passport = require('passport');

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}), function(req, res){
	if(req.user.token){
		//User requested password reset but logs in with current password
		db.users.update({username:req.user.username}, {token:null}, function(err, doc){
			res.redirect('/')
		})
	} else {
		res.redirect('/');
	}
});

/**
* Serve the login page
*/
app.get('/login', app.middleware.ensure.nologin, function(req, res) {
	if (req.user) // Already logged in
		return res.redirect('/');

	res.render('units/session/login', {
		layout: 'units/layouts/promo',
		namespace: 'plain',
		message: req.flash('passportMessage'),
	});
});

/**
* API to handle user login
*/
app.post('/api/users/login', function(req, res) {
	async()
		.then('profile', function(next) {
			passport.authenticate('local', function(err, user, info) {
				if (err) return next(err);
				if (user) {
					console.log(colors.green('Successful login for'), colors.cyan(req.body.username));
					req.logIn(user, function(err) {
						if (err) return next(err);
						next();
					});
				} else {
					console.log(colors.red('Failed login for'), colors.cyan(req.body.username));
					next('Unauthorized');
				}
			})(req, res, next);
		})
		.end(function(err) {
			if (err) return res.send({error: 'Invalid username or password'});
			res.redirect('/api/session/profile');
		});
});
