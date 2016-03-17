'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Log Schema
 */
var LogSchema = new Schema({
	action: {
		type: String,
		required: 'Please add action'
	},
	data: {
		type: Object,
		required: 'Please add a data object'
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: String,
		required: 'Please add a user'
	}
});

mongoose.model('Log', LogSchema);
