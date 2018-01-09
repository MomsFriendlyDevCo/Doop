var colors = require('chalk');
var connectFlash = require('connect-flash');
var expressSession = require('express-session');
var mongoSessionStore = require('connect-mongodb-session');
var monoxide = require('monoxide');
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;

app.register('preControllers', ['core.db'], function(finish) {
	app.use(connectFlash());

	var mongoStore = mongoSessionStore(expressSession);
	app.use(expressSession({
		secret: app.config.secret,
		store: new mongoStore({
			uri: app.config.mongo.uri,
			idField: 'sessionID',
		}),
		resave: false,
		saveUninitialized: false,
		cookie: {
			expires: new Date(Date.now() + (3600000 * 48)), // 48 hours
			maxAge: (3600000 * 48) // 48 hours
		}
	}));


	passport.use(new passportLocalStrategy({
		passReqToCallback: true,
		usernameField: 'username',
	}, function(req, username, password, next) {
		console.log(colors.blue('[LOGIN]'), 'Check login', colors.cyan(username));

		// Lookup user by username
		db.users.findOne({$errNotFound: false, username: username}, function(err, user) {
			if (err) return next(err);
			if (!user) {
				console.log(colors.blue('[LOGIN]'), 'Username not found', colors.cyan(username));
				return next(null, false, req.flash('passportMessage', 'Incorrect username'));
			} else if (user.status == 'unverified'){
				console.log(colors.blue('[LOGIN]'), 'Account not verified', colors.cyan(username));
				return next(null, false, req.flash('passportMessage', 'Account not verified'));
			} else {
				user.validPassword(password, function(err, isMatch) {
					if (err) return next(err);
					if (!isMatch) {
						console.log(colors.blue('[LOGIN]'), 'Invalid password for', colors.cyan(username));
						next(null, false, req.flash('passportMessage', 'Incorrect password'));
					} else {
						console.log(colors.blue('[LOGIN]'), 'Successful login for', colors.cyan(username));
						next(null, user);
					}
				});
			}
		});
	}));

	// Tell passport what to save to lookup the user on the next cycle
	passport.serializeUser(function(user, next) {
		next(null, user.username);
	});

	// Tell passport to to retrieve the full user we stashed in passport.serializeUser()
	passport.deserializeUser(function(id, next) {
		db.users
			.findOne({username: id})
			.exec(next);
	});

	// Boot passport and its session handler
	app.use(passport.initialize());
	app.use(passport.session());

	finish();
});
