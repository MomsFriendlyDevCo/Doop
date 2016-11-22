var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var email = require('mfdc-email');
var uuid = require('uuid');

/**
* Invite new users to the system (onboarding)
* NOTE: Only admins can do this
* @param {array} req.body.emails Array of email addresses to invite
*/
app.post('/api/users/invite', app.middleware.ensure.admin, function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.emails) return next('req.body.emails must be specified');
			if (!_.isArray(req.body.emails)) return next('req.body.emails must be an array');
			if (!req.body.emails.every(i => _.isString(i))) return next('req.body.emails must be an array of strings');
			console.log('User', colors.cyan(req.user.email), 'inviting', req.body.emails.map(u => colors.cyan(u)).join(', '));
			next();
		})
		// }}}
		// Check users don't already exist {{{
		.forEach(req.body.emails, function(next, email) {
			db.users.findOne({$errNotFound: false, email: email}, function(err, res) {
				if (err) return next(err);
				if (res) return next('User already exists: ' + email);
				next();
			});
		})
		// }}}
		// Create new users {{{
		.set('users', [])
		.forEach(req.body.emails, function(next, email) {
			var task = this;
			db.users.create({
				email: email,
				_token: uuid.v4(),
			}, function(err, res) {
				if (err) return next(err);
				task.users.push(res);
				next();
			});
		})
		// }}}
		// Email user invites {{{
		.forEach('users', function(next, user) {
			email()
				.to(user.email)
				.subject('Invite to ' + app.config.title)
				.template(app.config.paths.root + '/units/email/session.invite.email.txt')
				.templateParams({
					config: app.config,
					url: app.config.publicUrl + '/#/invite/accept/' + user._token,
				})
				.send(next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send({error: err.toString()});
			res.status(200).end();
		});
		// }}}
});


/**
* Accept an invite by its token
* @param {string} req.body.token The token to accept
* @param {string} req.body.name The users name to store
* @param {string} req.body.password The users password to store
*/
app.post('/api/users/inviteAccept', function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.token) return next('req.body.token must be specified');
			if (!req.body.name) return next('req.body.name must be specified');
			if (!req.body.password) return next('req.body.password must be specified');
			next();
		})
		// }}}
		// Find user {{{
		.then('user', function(next) {
			db.users.findOne({_token: req.body.token}, next);
		})
		// }}}
		// Update user {{{
		.then(function(next) {
			this.user._token = undefined;
			this.user.name = req.body.name;
			this.user.password = req.body.password;
			this.user.save(next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.status(400).send({error: err.toString()});
			res.status(200).end();
		});
		// }}}
});
