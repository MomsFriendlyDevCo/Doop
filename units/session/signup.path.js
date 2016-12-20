var async = require('async-chainable');
var email = require('mfdc-email');

/**
* Attempt signup sequence with given credentials
* @param {string} [req.body.name] The users real name if app.config.session.signup.requireName requires it
* @param {string} [req.body.username] The users requested username if app.config.session.signup.requireUsername requires it, otherwise the email is used
* @param {string} req.body.email The users email
* @param {string} req.body.password The users password
*/
app.post('/api/session/signup', function(req, res, finish) {
	async()
		.then(function(next) { // Form validation
			if (app.config.session.signup.requireName && !req.body.name) {
				next('No name specified')
			} else if (app.config.session.signup.requireUsername && !req.body.username) {
				next('No username specified')
			} else if (!req.body.email) {
				next('No email specified')
			} else if (!/^(.*)@(.*)$/.test(req.body.email)) { // FIXME: Ugh!
				next('That doesnt look like a valid email address')
			} else if (!req.body.password) {
				next('No password specified')
			} else {
				// Assign username=email if its optional
				if (!app.config.session.signup.requireUsername) req.body.username = req.body.email;
				next();
			}
		})
		.then(function(next) { // Check email isn't already in use
			db.users.findOne({$errNotFound: false, email: req.body.email}, function(err, user) {
				if (user) return next('Email already registered');
				next();
			});
		})
		.then(function(next) { // Check username isn't already in use
			db.users.findOne({username: req.body.username}, function(err, user) {
				if (user) return next('Username already registered');
				next();
			});
		})
		.then('user', function(next) { // Create the user
			var newUser = {
				name: req.body.name,
				username: req.body.username,
				email: req.body.email,
				password: req.body.password,
			};

			if (app.config.session.signup.validateEmail) {
				newUser.token = uuid.v4();
				newUser.status = 'unverified-email';
			}

			return db.users.create(newUser, next);
		})
		.then(function(next){
			if (app.config.session.signup.validateEmail) {
				email()
					.to(this.user.email)
					.subject(app.config.title + ' Signup')
					.template(app.config.paths.root + '/units/email/signup-verify.email.html')
					.templateParams({
						app: app,
						url: app.config.publicUrl + '/validate/' + this.user.token,
						user: this.user,
					})
					.send(next)
			} else {
				email()
					.to(this.user.email)
					.subject(app.config.title + ' Signup')
					.template(app.config.paths.root + '/units/email/signup-welcome.email.txt')
					.templateParams({
						app: app,
						url: app.config.publicUrl,
						user: this.user,
					})
					.send(next)
			}
		})
		.end(function(err) {
			if (err) { // There was an issue creating the account
				return res.status(400).send({error: err});
			} else {
				// Signup successfully processed, send pending verify and email status back to client
				return res.send({})
			}
		});
});


/**
* Validate the given token to complete a user's signup
*/
app.route('/validate/:token')
	.get(function(req, res) {
		async()
			// Sanity checks {{{
			.then(function(next) {
				if (!req.params.token) return next('No token provided');
				next();
			})
			// }}}
			// Find user by token (and reset it) {{{
			.then('user', function(next) {
				db.users.findOne({_token: req.params.token}, function(err, user) {
					if (err && err != 'Not found') return next(err);
					if (!user || err == 'Not found') return next('Could not validate token: no users match the provided token');

					user.status = 'active';
					user._token = undefined;

					user.save(next);
				});
			})
			// }}}
			// End {{{
			.end(function(err) {
				if (err) return res.status(400).send({ error: err });

				// Redirect to the login page on success
				res.redirect('/#/login');
			});
			// }}}
	});
