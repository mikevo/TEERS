'use strict';

var User = require('./users.server.controller.js');

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	if (req.user) {
		User.updateProfileThreshold(req.user);
	}

	res.render('index', {
		user: req.user || null,
		request: req
	});
};
