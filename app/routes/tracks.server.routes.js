'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var tracks = require('../../app/controllers/tracks.server.controller');

	// Tracks Routes
	app.route('/api/tracks')
		.get(users.requiresLogin, tracks.list);
	app.route('/api/tracks/:trackId')
		.get(users.requiresLogin, tracks.read);

	// Finish by binding the Track middleware
	app.param('trackId', tracks.trackByID);
};
