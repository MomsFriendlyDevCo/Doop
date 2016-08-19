/**
* Users controller
* Server-side logic for managing users
* User actions / flows related to user authentication are in `auth.ctrl.js`
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var email = require('mfdc-email');
var fs = require('fs');
var fspath = require('path');
var mkdirp = require('mkdirp');
var moment = require('moment');
var monoxide = require('monoxide');
var uuid = require('node-uuid');

/**
* Serves signup page
*/
app.get('/signup', app.middleware.ensure.nologin, function(req, res) {
	res.render('units/users/signup', {
		layout: 'units/layouts/main',
		namespace: 'plain',
		message: req.flash('signupMessage'),
		values: {key: '', name: '', email: '', password: ''},
	});
});

/**
 * API to handle user signup submissions
 */
app.post('/signup', app.middleware.ensure.nologin, function(req, res, finish) {
	// Rather crappy checking - yes this needs improvement MC 2014-12-31

	async()
		.then(function(next) { // Form validation
			if (!req.body.name) {
				next('No name specified');
			} else if (!req.body.email) {
				next('No email specified');
			} else if (!/^(.*)@(.*)$/.test(req.body.email)) { // FIXME: Ugh!
				next('That doesnt look like a valid email address');
			} else if (!req.body.password) {
				next('No password specified');
			} else {
				next();
			}
		})
		.then(function(next) { // Check email isn't already in use
			return db.users.findOne({
				$or: [
					{ username: req.body.email },
					{ email: req.body.email },
			]},
			function(err, user) {
				// Don't want to show 'Not found' errors as that's intended for signup to proceed
				if (err && err !== 'Not found') return next(err);
				if (user) return next('Email already registered');
				next();
			});
		})
		.then('user', function(next) { // Create the user
			return db.users.create({
				name: req.body.name,
				email: req.body.email,
				username: req.body.username || req.body.email,
				password: req.body.password,
				status: 'pendingVerify',
				token: uuid.v4(), // FIXME: Should improve token generation to a better hash
			}, next);
		})
		.then(function(next) {
			// Dispatch signup email with account verfication link
			email
				.to(req.body.email)
				.subject('4ME Training Registration - Account Verification')
				.template(app.config.paths.server + '/units/users/signup.email.html')
				.templateParams({
					// Construct the link the user will need to activate to verify their account and thus complete signup
					tokenURI: app.config.url + '/validate/' + this.user.token,
				})
				.send(next);
		})
		.end(function(err) {
			// There was an issue creating the account
			if (err) return res.status(400).json({ error: err });

			res.json({
				message: 'Signup success!',
				userid: this.user._id,
			});
		});
});

app.use('/api/users/:id?', monoxide.express.middleware('users', {
	query: [ app.middleware.ensure.admin ],
	create: [],
	save: [ app.middleware.ensure.login ],
	get: [ app.middleware.ensure.login ],
	delete: [ app.middleware.ensure.admin ]
}));
