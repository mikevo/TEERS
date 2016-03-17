'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Log = mongoose.model('Log'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, log;

/**
 * Log routes tests
 */
describe('Log CRUD tests', function() {
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

		// Save a user to the test db and create new Log
		user.save(function() {
			log = {
				action: 'test',
				data: 'Log Name',
				user: user.username
			};

			done();
		});
	});

	it('should be able to save Log instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Log
				agent.post('/api/logs')
					.send(log)
					.expect(200)
					.end(function(logSaveErr, logSaveRes) {
						// Handle Log save error
						if (logSaveErr) done(logSaveErr);

						// Get a list of Logs
						agent.get('/api/logs')
							.end(function(logsGetErr, logsGetRes) {
								// Handle Log save error
								if (logsGetErr) done(logsGetErr);

								// Get Logs list
								var logs = logsGetRes.body;

								// Set assertions
								(logs.length).should.be.greaterThan(0);
								(logs[0].data).should.match('Log Name');
								(logs[0].user).should.match(user.username);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Log instance if not logged in', function(done) {
		agent.post('/api/logs')
			.send(log)
			.expect(401)
			.end(function(logSaveErr, logSaveRes) {
				// Call the assertion callback
				done(logSaveErr);
			});
	});

	it('should not be able to save Log instance if no name is provided', function(done) {
		// Invalidate name field
		log.data = null;

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Log
				agent.post('/api/logs')
					.send(log)
					.expect(400)
					.end(function(logSaveErr, logSaveRes) {
						// Set message assertion
						(logSaveRes.body.message).should.match('Please add a data object');

						// Handle Log save error
						done(logSaveErr);
					});
			});
	});

	it('should not be able to get a list of Logs if not signed in', function(done) {
		// Create new Log model instance
		var logObj = new Log(log);

		// Save the Log
		logObj.save(function() {
			// Request Logs
			agent.post('/api/logs')
				.send(log)
				.expect(401)
				.end(function(logSaveErr, logSaveRes) {
					// Set message assertion
					(logSaveRes.body.message).should.match('User is not logged in');

					// Handle Log save error
					done(logSaveErr);
				});
		});
	});


	it('should not be able to get a single Log if not signed in', function(done) {
		// Create new Log model instance
		var logObj = new Log(log);

		// Save the Log
		logObj.save(function() {
			agent.get('/api/logs/' + logObj._id)
				.send(log)
				.expect(401)
				.end(function(logSaveErr, logSaveRes) {
					// Set message assertion
					(logSaveRes.body.message).should.match('User is not logged in');

					// Handle Log save error
					done(logSaveErr);
				});
		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Log.remove().exec();
		done();
	});
});
