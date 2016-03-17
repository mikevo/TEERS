'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var config = require('../../app/controllers/config.server.controller');

	// Configs Routes
	app.route('/api/config')
		.get(config.list);
};
