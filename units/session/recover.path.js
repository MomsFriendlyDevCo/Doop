var async = require('async-chainable');
var email = require('mfdc-email');
var uuid = require('uuid');

/**
* Send a password reset email to a user
* @param {string} req.body.email The users email address
*/
app.post('/api/users/recover', function(req, res){
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.email) return next('No email provided');
			next();
		})
		// }}}
		// Find user {{{
		.then('user', function(next) {
			db.users.findOne({ email: req.body.email, $errNotFound: false }, function(err, user) {
				if (err) return next(err);
				if (!user) return next(`Email ${req.body.email} is not an active account`)
				next(null, user);
			});
		})
		// }}}
		// Set token {{{
		.then(function(next) {
			this.user._token = uuid.v4();
			this.user.save(next);
		})
		// }}}
		// Send email {{{
		.then(function(next) {
			email()
				.to(this.user.email)
				.subject(app.config.title + ' password reset')
				.template(app.config.paths.root + '/units/email/password-reset.email.txt')
				.templateParams({
					config: app.config,
					url: app.config.publicUrl + '/#/login/recover/' + this.user._token,
				})
				.send(next)
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) {
				res.status(400).send({error: err.toString()});
			} else {
				res.status(200).end();
			}
		});
		// }}}
})

/**
* Accept a password recovery email
* @param {string} req.body.token The token to accept
* @param {string} req.body.password The users password to store
*/
app.post('/api/users/recoverAccept', function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.token) return next('req.body.token must be specified');
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
