'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var recommendations = require('../../app/controllers/recommendations.server.controller');

	// Recommendations Routes
	app.route('/api/recommendations')
		.post(users.requiresLogin, recommendations.list);
	app.route('/api/recommendations/contexts')
		.get(users.requiresLogin, recommendations.getContexts);
};
