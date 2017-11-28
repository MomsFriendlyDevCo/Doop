var expect = require('chai').expect;

describe('Session Unit', function() {

	var user;
	it('should be able to login', function(done) {
		this.timeout(5 * 1000);
		app.test.agent.post(app.config.url + '/api/session/login')
			.send({
				username: app.test.username,
				password: app.test.password,
			})
			.end(function(err, res) {
				if (res.body.error) mlog.error(res.body.error);
				expect(res.body).to.not.have.property('error');
				expect(err).to.be.not.ok;
				user = res.body;

				done();
			});
	});

	it('should have a valid profile', function() {
		expect(user).to.have.property('_id');
		expect(user).to.have.property('username', app.test.username); // Check we got the user we asked for
		expect(user).to.not.have.property('password');
		expect(user).to.not.have.property('_passhash');
		expect(user).to.not.have.property('_passsalt');
		expect(user).to.have.property('name');
		expect(user).to.have.property('role');
		expect(user).to.have.property('isAdmin');
		expect(user.isAdmin).to.be.a('boolean');
		expect(user).to.have.property('isRoot');
		expect(user.isRoot).to.be.a('boolean');
		expect(user).to.have.property('settings');
		expect(user.settings).to.be.an('object');
	});

});
