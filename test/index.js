var glob = require('glob');

// Load the app stub
require('../units/core/backend');

// Provide a superagent session and other shared information
app.test = {
	agent: require('superagent').agent(),
	user: null, // Gets populated after login
	username: 'mc',
	password: 'qwaszx',
};


// Load the database
before(function(done) {
	require(app.config.paths.root + '/units/db/loader')(function(err, models) {
		if (err) return done(err);
		global.db = app.db = models;
		done();
	});
});


// Login
before(function(done) {
	this.timeout(5 * 1000);
	app.test.agent.post(app.config.url + '/api/session/login')
		.send({
			username: app.test.username,
			password: app.test.password,
		})
		.end(function(err, res) {
			if (err) return done(err);
			if (res.body.error) return done(res.body.error);
			app.test.user = res.body;
			done();
		});
});


// Load all test files into Mocha
glob.sync(app.config.paths.root + '/units/**/*.test.js')
	.forEach(function(path) {
		require(path);
	});
