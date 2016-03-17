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
 * Config routes tests
 */
describe('Config API tests', function() {
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
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Config
    user.save(function() {
      done();
    });
  });

  it('should be able to load config if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Config
        agent.get('/api/config')
          .expect(200)
          .end(function(configErr, configRes) {
            // Handle Config save error
            if (configErr) done(configErr);
            // Get Configs list
            var config = configRes.body;

            // Set assertions
            (config.profile).should.not.equal(null);
            (config.profile.minSize).should.be.greaterThan(1);
            (config.profile.wantedSize).should.be.greaterThan(config.profile.minSize);
						(config.profile.starRating).should.be.type('boolean');
						(config.profile.starMaxRating).should.be.within(1,9);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to load config if not logged in', function(done) {
    agent.get('/api/config')
      .expect(200)
      .end(function(configSaveErr, configSaveRes) {
        // Call the assertion callback
        done(configSaveErr);
      });
  });

  afterEach(function(done) {
    User.remove().exec();
    done();
  });
});
