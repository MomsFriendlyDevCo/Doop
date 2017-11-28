var _ = require('lodash');
var expect = require('chai').expect;
var moment = require('moment');

describe('requestCaches - expiring requestCaches', function() {

	it('should create an intentionally expiring requestCaches object', function(done) {
		db.requestCaches.create({
			expires: moment().subtract(2, 'weeks').toDate(),
			type: 'mocha',
		}, done);
	});

	it('should clean up the requestCaches correctly', function(done) {
		db.requestCaches.clean(done);
	});

	it('should not have any expiring objects within the requestCaches post-clean', function(done) {
		db.requestCaches.find({expires: {$lt: new Date()}, $errNotFound: false}, function(err, res) {
			expect(err).to.not.be.ok;
			expect(res).to.be.an('array');
			expect(res).to.have.length(0);
			done();
		});
	});
	
});


describe('requestCaches.runConditional()', function() {

	var workerFunc = function() { return _.random(1000, 9999) };
	var lastWorker;

	before('remove all test requestCaches', function(done) {
		db.requestCaches.remove({type: 'mocha'}, done);
	});

	it('should generate new responses', function(done) {
		db.requestCaches.runConditional(
			'mocha',
			{foo: 'foo!', bar: 'baz!'},
			function(next) {
				lastWorker = workerFunc();
				next(null, lastWorker);
			},
			function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.a('number');
				done();
			}
		);

	});

	it('should return the same response for every other run', function(done) {
		db.requestCaches.runConditional(
			'mocha',
			{bar: 'baz!', foo: 'foo!'},
			function(next) {
				// Should never run this
				expect.fail();
			},
			function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.a('number');
				expect(res).to.be.equal(lastWorker);
				done();
			}
		);
	});

});
