'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');
	var logs = require('../../app/controllers/logs.server.controller');

	// Setting up the users profile api
	app.route('/api/users/me').get(users.requiresLogin, users.me);
	app.route('/api/users').put(users.requiresLogin, users.update);
	app.route('/api/users/me/tracks').get(users.requiresLogin, users.trackProfile);

	// Setting up the users password api
	app.route('/api/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.requiresLogin, users.signout);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
