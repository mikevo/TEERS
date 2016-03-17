'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Log = mongoose.model('Log'),
	_ = require('lodash');

/**
 * Adds a log to the DB
 */
exports.add = function(user, action, data, callback) {
	var log = new Log();
	log.action = action;
	log.data = data;
	log.user = user.username;

	log.save(callback);

	return log;
};

/**
 * Create a Log
 */
exports.create = function(req, res) {
	var log = module.exports.add(req.user, req.body.action, req.body.data, function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(log);
		}
	});
};

/**
 * Show the current Log
 */
exports.read = function(req, res) {
	res.jsonp(req.log);
};

/**
 * List of Logs
 */
exports.list = function(req, res) {
	Log.find().sort('-created').exec(function(err, logs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(logs);
		}
	});
};

/**
 * Log middleware
 */
exports.logByID = function(req, res, next, id) {
	Log.findById(id).exec(function(err, log) {
		if (err) return next(err);
		if (!log) return next(new Error('Failed to load Log ' + id));
		req.log = log;
		next();
	});
};

/**
 * Log authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.log.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
