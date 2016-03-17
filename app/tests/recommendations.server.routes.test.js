'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user;

/**
 * Recommendations routes tests
 */
describe('Recommendations Routes Unit Tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password
		});

		// Save a user to the test db
		user.save(function() {
			done();
		});
	});

	it('should not get recommendations if not signed in', function(done) {
		// Load recommendations
		agent.post('/api/recommendations')
			.send({
				context: 'Dummy 1'
			})
			.expect(401)
			.end(function(tracksErr, TracksRes) {

				if (tracksErr) {
					return done(tracksErr);
				}

				// Call the assertion callback
				done();
			});
	});

	it('should be able to get a recommendations if signed in', function(done) {
		this.timeout(10000);
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				agent.post('/api/recommendations')
					.send({
						context: 'Dummy 1'
					})
					.expect(200)
					.end(function(tracksErr, tracksRes) {
						if (tracksErr) {
							return done(tracksErr);
						}

						// Set assertion
						tracksRes.body.forEach(function(elem, index, array) {
							elem.should.be.an.Object.with.property('uri');
						});

						// Call the assertion callback
						done();
					});
			});
	});

	afterEach(function(done) {
		User.remove().exec(done);
	});
});
