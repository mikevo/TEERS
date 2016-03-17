'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var logs = require('../../app/controllers/logs.server.controller');

	// Logs Routes
	app.route('/api/logs')
		.get(users.requiresLogin, logs.list)
		.post(users.requiresLogin, logs.create);

	app.route('/api/logs/:logId')
		.get(users.requiresLogin, logs.read);

	// Finish by binding the Log middleware
	app.param('logId', logs.logByID);
};
