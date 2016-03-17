'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	logs = require('../logs.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove some fields from the req.body object
	delete req.body.roles;
	delete req.body.salt;
	delete req.body.created;
	delete req.body._v;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.displayName = user.firstName + ' ' + user.lastName;

	if (user.username === 'SYSTEM') {
		var data = {
			status: 'ERROR',
			message: 'Tried to signup with username SYSTEM'
		};

		logs.add({ username: 'SYSTEM' }, 'signup', data);
		return res.status(400).send({
			message: 'testing error message'
		});
	}

	// Then save the user
	user.save(function(err) {
		if (err) {
			var data = {
				status: 'ERROR',
				message: errorHandler.getErrorMessage(err)
			};

			logs.add({ username: 'SYSTEM' }, 'signup', data);

			return res.status(400).send({
				message: data.message
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					var errorData = {
						status: 'ERROR',
						message: err
					};

					logs.add(user, 'signup', errorData);
					res.status(400).send(err);
				} else {
					var data = {
						status: 'SUCCESS',
						message: 'success'
					};

					logs.add(req.user, 'signup', data);
					module.exports.updateProfileThreshold(user);
					res.json(user);
				}
			});
		}
	});
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			var data = {
				status: 'ERROR',
				message: info
			};

			logs.add({ username: 'SYSTEM' }, 'signin', data);
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					var errorData = {
						status: 'ERROR',
						message: err
					};

					logs.add(user, 'signin', errorData);
					res.status(400).send(err);
				} else {
					var data = {
						status: 'SUCCESS',
						message: 'success'
					};

					logs.add(user, 'signin', data);
					module.exports.updateProfileThreshold(user);
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	var data = {
		status: 'SUCCESS',
		message: 'success'
	};

	logs.add(req.user, 'signout', data);
	req.logout();
	res.redirect('/');
};
