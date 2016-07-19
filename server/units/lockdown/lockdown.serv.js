app.register('preControllers', function(finish) {
	// Enable this to temporarily lock down the server quickly
	// app.use(express.basicAuth('user', 'letmein'));

	// Lookup auth details from app.config.access.users
	if (app.config.access && app.config.access.lockdown) {
		var basicAuth = require('basic-auth-connect');
		app.use(basicAuth(function(user, pass) {
			var usr = _.find(app.config.access.users, {user: usr});
			return (usr && pass == usr.pass);
		}, app.config.title + ' - Private'));
	}

	finish();
});
