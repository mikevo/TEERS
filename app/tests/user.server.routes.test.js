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
var app, agent, credentials, user;

/**
 * User routes tests
 */
describe('User Routes Unit Tests', function() {
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

	it('should be able to signin', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				done();
			});
	});

	it('should be able to signout after signin', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				agent.get('/auth/signout')
					.expect(302)
					.end(function(signoutErr, signoutRes) {
						if (signoutErr) {
							return done(signoutErr);
						}

						signoutRes.headers.location.should.equal('/');

						done();
					});
			});
	});

	it('should be able to signup', function(done) {
		var userObject = {
			firstName: 'Test',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username + '1',
			password: credentials.password
		};

		user.save(function() {
			agent.post('/auth/signup')
				.send(userObject)
				.expect(200)
				.end(function(signupErr, signupRes) {
					// Handle signin error
					if (signupErr) {
						return done(signupErr);
					}

					done();
				});
		});
	});

	it('should be able to login after signup', function(done) {
		var userObject = {
			firstName: 'Test',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username + '1',
			password: credentials.password
		};

		user.save(function() {
			agent.post('/auth/signup')
				.send(userObject)
				.expect(200)
				.end(function(signupErr, signupRes) {
					// Handle signin error
					if (signupErr) {
						return done(signupErr);
					}

					agent.post('/auth/signin')
						.send(userObject)
						.expect(200)
						.end(function(signinErr, signinRes) {
							// Handle signin error
							if (signinErr) {
								return done(signinErr);
							}

							done();
						});
				});
		});
	});

	it('should be able to get his profile', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				agent.get('/api/users/me')
					.expect(200)
					.end(function(userGetErr, userGetRes) {
						// Handle signin error
						if (userGetErr) {
							return done(userGetErr);
						}

						userGetRes.body.firstName.should.equal(user.firstName);
						userGetRes.body.lastName.should.equal(user.lastName);
						userGetRes.body.email.should.equal(user.email);
						userGetRes.body.username.should.equal(user.username);
						userGetRes.body.profileComplete.should.equal(false);
						done();
					});
			});
	});

	it('should be able to update his profile', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				var userObject = {
					lastName: 'LastName'
				};

				agent.put('/api/users')
					.send(userObject)
					.expect(200)
					.end(function(userGetErr, userGetRes) {
						// Handle signin error
						if (userGetErr) {
							return done(userGetErr);
						}

						userGetRes.body.firstName.should.equal(user.firstName);
						userGetRes.body.lastName.should.equal(userObject.lastName);
						userGetRes.body.email.should.equal(user.email);
						userGetRes.body.username.should.equal(user.username);
						userGetRes.body.profileComplete.should.equal(false);
						done();
					});
			});
	});

	it('should not be able to update some attributes', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				var idObject = {
					_id: '10'
				};

				agent.put('/api/users')
					.send(idObject)
					.expect(400)
					.end(function(userGetErr, userGetRes) {
						// Handle signin error
						if (userGetErr) {
							return done(userGetErr);
						}


						var userObject = {
							username: 'username',
							password: 'test123',
							profileComplete: true
						};

						agent.put('/api/users')
							.send(userObject)
							.expect(200)
							.end(function(userGetErr, userGetRes) {
								// Handle signin error
								if (userGetErr) {
									return done(userGetErr);
								}

								userGetRes.body.username.should.equal(credentials.username);

								agent.get('/auth/signout')
									.expect(302)
									.end(function(signoutErr, signoutRes) {
										if (signoutErr) {
											return done(signoutErr);
										}

										agent.post('/auth/signin')
											.send(credentials)
											.expect(200)
											.end(function(signinErr, signinRes) {
												// Handle signin error
												if (signinErr) {
													return done(signinErr);
												}

												userGetRes.body.profileComplete.should.equal(false);
												done();
											});
									});
							});
					});
			});
	});

	it('should be able to change his password', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) {
					return done(signinErr);
				}

				var newCredentials = {
					username: 'username',
					password: 'test123'
				};

				var passwordDetails = {
					currentPassword: credentials.password,
					newPassword: newCredentials.password,
					verifyPassword: newCredentials.password
				};

				agent.post('/api/users/password')
					.send(passwordDetails)
					.expect(200)
					.end(function(userGetErr, userGetRes) {
						// Handle signin error
						if (userGetErr) {
							return done(userGetErr);
						}

						agent.get('/auth/signout')
							.expect(302)
							.end(function(signoutErr, signoutRes) {
								if (signoutErr) {
									return done(signoutErr);
								}

								agent.post('/auth/signin')
									.send(credentials)
									.expect(400)
									.end(function(signinErr, signinRes) {
										// Handle signin error
										if (signinErr) {
											return done(signinErr);
										}

										agent.post('/auth/signin')
											.send(newCredentials)
											.expect(200)
											.end(function(signinErr, signinRes) {
												// Handle signin error
												if (signinErr) {
													return done(signinErr);
												}

												done();
											});
									});
							});
					});
			});
	});

	afterEach(function(done) {
		User.remove().exec(done);
	});
});
