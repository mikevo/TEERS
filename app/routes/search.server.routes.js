'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var search = require('../../app/controllers/search.server.controller');

	// search Routes
	app.route('/api/search')
		.post(users.requiresLogin, search.execute);
};
