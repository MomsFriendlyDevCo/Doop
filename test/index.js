var glob = require('glob');

// Load the app stub
require('../units/core/app');

// Provide a superagent session and other shared information
app.test = {
	agent: require('superagent').agent(),
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

// Load all test files into Mocha
glob.sync(app.config.paths.root + '/units/**/*.test.js')
	.forEach(function(path) {
		require(path);
	});
