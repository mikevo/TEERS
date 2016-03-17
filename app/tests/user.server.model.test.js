'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Globals
 */
var user, user2;

/**
 * Unit model tests
 */
describe('User Model Unit Tests:', function() {
	before(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		done();
	});

	it('should begin with no users', function(done) {
		User.find({}, function(err, users) {
			users.should.have.length(0);
			done();
		});
	});

	it('should be able to save without problems', function(done) {
		user.save(done);
	});

	it('should fail to save an existing user again', function(done) {
		user.save();
		return user2.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should be able to add a user profile', function(done) {
		user.profile.push({
			'spotifyId': 'spotify:track:0J5YYohq5WoOAsO891rosH',
			'ratingValue': 10,
			'addedAt': 'track_selector'
		});

		return user.save(function(err, u) {
			u.profile.should.have.length(1);
			u.profile[0].should.have.property('spotifyId', 'spotify:track:0J5YYohq5WoOAsO891rosH');
			u.profile[0].should.have.property('ratingValue', 10);
			u.profile[0].should.have.property('addedAt', 'track_selector');
			done();
		});
	});

	it('should be able to update the user profile rating value', function(done) {
		user.profile[0].ratingValue = 5;

		return user.save(function(err, u) {
			u.profile.should.have.length(1);
			u.profile[0].should.have.property('spotifyId', 'spotify:track:0J5YYohq5WoOAsO891rosH');
			u.profile[0].should.have.property('ratingValue', 5);
			u.profile[0].should.have.property('addedAt', 'track_selector');
			done();
		});
	});

	it('should be able to update the user profile added at', function(done) {
		user.profile[0].addedAt = 'recommendation';

		return user.save(function(err, u) {
			u.profile.should.have.length(1);
			u.profile[0].should.have.property('spotifyId', 'spotify:track:0J5YYohq5WoOAsO891rosH');
			u.profile[0].should.have.property('ratingValue', 5);
			u.profile[0].should.have.property('addedAt', 'recommendation');
			done();
		});
	});

	it('should be able to show an error when try to save without first name', function(done) {
		user.firstName = '';
		return user.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should be able to show an error when try to save with first name null', function(done) {
		user.firstName = null;
		return user.save(function(err) {
			should.exist(err);
			done();
		});
	});

	after(function(done) {
		User.remove().exec();
		done();
	});
});
