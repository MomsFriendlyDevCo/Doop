var expect = require('chai').expect;

describe('ReST interface /api/users', function() {

	it('GET /api/users', function(done) {
		app.test.agent.get(app.config.url + '/api/users')
			.end(function(err, res) {
				if (res.body.error) return done(res.body.error);
				expect(err).to.not.be.ok;
				expect(res.body).to.be.an('array');

				res.body.forEach(function(i) {
					expect(i).to.have.property('_id');
					expect(i).to.not.have.property('_passhash');
					expect(i).to.not.have.property('_passhash2');
					expect(i).to.not.have.property('_passsalt');
					expect(i).to.not.have.property('_token');
					expect(i).to.have.property('address');
					expect(i.address).to.have.property('country');
					expect(i.address.country).to.be.a.string;
					expect(i.address).to.have.property('postcode');
					expect(i.address.postcode).to.be.a.string;
					expect(i.address).to.have.property('state');
					expect(i.address.state).to.be.a.string;
					expect(i.address).to.have.property('street');
					expect(i.address.street).to.be.a.string;
					expect(i.address).to.have.property('city');
					expect(i.address.city).to.be.a.string;
					expect(i).to.have.property('created');
					expect(i.created).to.be.a.string;
					expect(i).to.have.property('email');
					expect(i.email).to.be.a.string;
					expect(i).to.have.property('lastLogin');
					expect(i.lastLogin).to.be.a.string;
					expect(i).to.have.property('name');
					expect(i.name).to.be.a.string;
					expect(i).to.have.property('role');
					expect(i.role).to.be.a.string;
					expect(i.role).to.be.oneOf(['user', 'admin', 'root']);
					expect(i).to.have.property('settings');
					expect(i).to.have.property('status');
					expect(i.status).to.be.a.string;
					expect(i.status).to.be.oneOf(['active', 'deleted']);
					expect(i).to.have.property('username');
					expect(i.username).to.be.a.string;
				});

				done();
			});
	});

});