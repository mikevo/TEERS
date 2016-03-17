'use strict';

var should = require('should'),
  request = require('supertest'),
  app = require('../../server'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  agent = request.agent(app),
  globalConfig = require('../../config.json');

/**
 * Globals
 */
var credentials, user, search;

/**
 * Search routes tests
 */
describe('Search API tests', function() {
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

    // Save a user to the test db and create new Search
    user.save(function() {
      search = {
        query: 'Fight Song'
      };

      done();
    });
  });

  it('should be able to search if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Search
        agent.post('/api/search')
          .send(search)
          .expect(200)
          .end(function(searchErr, searchRes) {
            // Handle Search save error
            if (searchErr) done(searchErr);
            // Get search list
            var search = searchRes.body;

            // Set assertions
            (search.length).should.be.within(1, globalConfig.spotify.maxNumOfSearchResults);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should not be able to search if not logged in', function(done) {
    agent.post('/api/search')
      .send(search)
      .expect(401)
      .end(function(searchSaveErr, searchSaveRes) {
        // Call the assertion callback
        done(searchSaveErr);
      });
  });

  afterEach(function(done) {
    User.remove().exec();
    done();
  });
});
