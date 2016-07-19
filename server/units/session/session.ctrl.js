/**
* User session controller
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

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

/**
 * Serves login page
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
 * API for active user profile data
 */
app.get('/api/session/profile', function(req, res) {
	if (!req.user) return res.status(200).send({});

	// Decide what gets exposed to the front-end
	// First, set flags and fields applicable to all user roles
	var user = {
		_id: req.user._id,
		username: req.user.username,
		email: req.user.email,
		name: req.user.name,
		role: req.user.role,
		profileImage: req.user.profileImage,
		isAdmin: (req.user.role == 'admin' || req.user.role == 'root'),
		isRoot: (req.user.role == 'root'),
		settings: req.user.settings || null,
		advertisement: req.user.advertisement,
		presets: req.user.presets,
		achievements: req.user.achievements,
		injuries: req.user.injuries
	};

	// Expose profile info, if applicable
	if (!user.isAdmin) {
		_.assign(user, _.pick(req.user, ['dob', 'gender', 'gym', 'location', 'name', 'injuries', 'settings']));
		user.isPendingInfo = (req.user.status == 'pendingInfo');
	}

	// Expose subscription info, if applicable
	if (!user.isAdmin && _.has(req.user, '_auth.subscription')) {
		_.set(user, 'subscription.isPremium', (req.user._auth.subscription.type == 'premium' || req.user._auth.subscription.type == 'trial'));
		_.set(user, 'subscription.type', req.user._auth.subscription.type);
		_.set(user, 'subscription.expiry', req.user._auth.subscription.expiry || null);
	}

	res.json(user);
});

/**
* Save the user profile
* @param object req.body.settings Settings object to save
*/
app.post('/api/session/profile', app.middleware.ensure.login, function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.user) return next('User is not logged in');
			if (!req.body || !_.isObject(req.body)) return next('Nothing to save');
			next();
			// }}}
		})
		.then(function(next) {
			_.merge(req.user, _.pick(req.body, ['dob', 'gender', 'gym', 'location', 'name', 'injuries', 'settings']));
			req.user.save();
			next();
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.status(200).end();
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

/**
 * API to handle user logout
 */
app.post('/api/users/logout', app.middleware.ensure.login, function(req, res) {
	req.logout();
	res.status(200).send({});
});
