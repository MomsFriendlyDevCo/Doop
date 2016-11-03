var expect = require('chai').expect;

describe('ReST interface /api/users', function() {

	it('GET /api/users', function(done) {
		app.test.agent.get(app.config.url + '/api/users')
			.end(function(err, res) {
				if (res.body.error) return done(res.body.error);
				expect(err).to.not.be.ok;
				expect(res.body).to.be.an.array

				res.body.forEach(function(i) {
					expect(i).to.have.property('_id');
					expect(i).to.not.have.property('_passhash');
					expect(i).to.not.have.property('_passhash2');
					expect(i).to.not.have.property('_passsalt');
					expect(i).to.not.have.property('_token');
					expect(i).to.have.deep.property('address.country');
					expect(i.address.country).to.be.a.string;
					expect(i).to.have.deep.property('address.postcode');
					expect(i.address.postcode).to.be.a.string;
					expect(i).to.have.deep.property('address.state');
					expect(i.address.state).to.be.a.string;
					expect(i).to.have.deep.property('address.street');
					expect(i.address.street).to.be.a.string;
					expect(i).to.have.deep.property('address.suburb');
					expect(i.address.suburb).to.be.a.string;
					expect(i).to.have.deep.property('availability.friday');
					expect(i.availability.friday).to.be.a.boolean;
					expect(i).to.have.deep.property('availability.monday');
					expect(i.availability.monday).to.be.a.boolean;
					expect(i).to.have.deep.property('availability.saturday');
					expect(i.availability.saturday).to.be.a.boolean;
					expect(i).to.have.deep.property('availability.sunday');
					expect(i.availability.sunday).to.be.a.boolean;
					expect(i).to.have.deep.property('availability.thursday');
					expect(i.availability.thursday).to.be.a.boolean;
					expect(i).to.have.deep.property('availability.tuesday');
					expect(i.availability.tuesday).to.be.a.boolean;
					expect(i).to.have.deep.property('availability.wednesday');
					expect(i.availability.wednesday).to.be.a.boolean;
					expect(i).to.have.property('created');
					expect(i.created).to.be.a.date;
					expect(i).to.have.property('email');
					expect(i.email).to.be.a.string;
					expect(i).to.have.property('hold');
					expect(i.hold).to.be.a.string;
					expect(i.hold).to.be.oneOf(['active', 'hold']);
					expect(i).to.have.property('holdReason');
					expect(i.holdReason).to.be.a.string;
					expect(i).to.have.property('lastLogin');
					expect(i.lastLogin).to.be.a.date;
					expect(i).to.have.property('name');
					expect(i.name).to.be.a.string;
					expect(i).to.have.property('role');
					expect(i.role).to.be.a.string;
					expect(i.role).to.be.oneOf(['driver', 'admin', 'manager', 'root']);
					expect(i).to.have.property('settings');
					expect(i).to.have.property('status');
					expect(i.status).to.be.a.string;
					expect(i.status).to.be.oneOf(['active', 'deleted']);
					expect(i).to.have.property('tags');
					expect(i.tags).to.be.an.array;
					expect(i).to.have.property('username');
					expect(i.username).to.be.a.string;

				});

				done();
			});
	});

});