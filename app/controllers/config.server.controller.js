'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash'),
	globalConfig = require('../../config.json');

/**
 * List of Configs
 */
exports.list = function(req, res) {
	var config = {};

	config.profile = globalConfig.profile;
	config.views = globalConfig.views;

	res.jsonp(config);
};
