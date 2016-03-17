'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validatePropertyNotEmpty = function(property) {
	return (property && property.length);
};

/**
 * A Validation function for local strategy password
 */
var validatePassword = function(password) {
	return (password && password.length > 6);
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validatePropertyNotEmpty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validatePropertyNotEmpty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validatePropertyNotEmpty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validatePassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
	questionnaire: {
		age: {
			type: 'String'
		},
		gender: {
			type: 'String',
			enum: ['female', 'male']
		},
		listeningHours: {
			type: 'String'
		}
	},
	profile: [{
			created: {
				type: Date,
				default: Date.now
			},
			spotifyId: {
				type: 'String'
			},
			ratingValue: {
				type: 'Number'
			},
			addedAt: {
				type: 'String',
				enum: ['track_selector', 'track_detail', 'track_search', 'recommendation', 'user_track_profile']
			}
		}],
	profileComplete: {
		type: 'Boolean',
		default: false
	},
	profileThreshold: {
		type: 'Number',
		default: null
	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('User', UserSchema);
