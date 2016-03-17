'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  request = require('request'),
  User = mongoose.model('User'),
  recommendation = require('../recommendations.server.controller'),
  tracks = require('../tracks.server.controller'),
  globalConfig = require('../../../config.json');

var saveUser = function(user, req, res) {
  user.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function(err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          module.exports.updateProfileThreshold(user);
          return res.json(user);
        }
      });
    }
  });
};

var deleteRecSysUserProfile = function(user, trackProfile, req, res) {
  var contextReq = {
    'auth': {
      'user': globalConfig.recSys.user,
      'pass': globalConfig.recSys.password,
      'sendImmediately': true
    },
    method: 'POST',
    url: globalConfig.recSys.deleteUrl,
    body: JSON.stringify({
      userId: user.username
    }),
    headers: {
      'content-type': globalConfig.recSys.contentType
    }
  };

  request(contextReq,
    function(err, response, body) {
      var success = false;

      if (!err && response.statusCode === 200) {
        success = true;
      } else if (response.statusCode === 400) {
        // NOTE: workarround because field with name error can not be accessed
        if (JSON.stringify(body).indexOf('user not found') > -1) {
          success = true;
        }
      }

      if (success) {
        user.profile = [];
        user.profileComplete = false;
        saveUser(user, req, res);
      } else {
        return res.status(400).send({
          message: 'Failed to delete track profile'
        });
      }
    });
};

/**
 * Update user details
 */
exports.update = function(req, res) {
  // Init Variables
  var user = req.user;
  var message = null;

  var deleteProfile = req.body.deleteProfile;

  // For security measurement we remove some fields from the req.body object
  delete req.body.roles;
  delete req.body.salt;
  delete req.body.username;
  delete req.body.password;
  delete req.body.created;
  delete req.body._v;
  delete req.body.deleteProfile;

  if (user) {
    if (req.body._id && req.body._id !== user._id.toString()) {
      return res.status(400).send({
        message: 'User _id invalid'
      });
    }


    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    var userProfile = recommendation.loadProfile(user.profile, user.profileThreshold);

    user.profileComplete = (userProfile.like.length >= globalConfig.profile.minSize);

    // NOTE: Possible performance bug
    User.findById(user._id).exec(function(err, userInDb) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      if (!userInDb) {
        return res.status(400).send({
          message: 'Failed to load User'
        });
      }

      if (!userInDb.profileThreshold) {
        user.profileThreshold = null;
      }

      if (deleteProfile === true) {
        deleteRecSysUserProfile(user, userInDb.profile, req, res);
      } else {
        saveUser(user, req, res);
      }
    });

  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

exports.trackProfile = function(req, res) {
  var trackProfile = req.user.profile;
  if (trackProfile) {
    var userTracks = [];
    var profileLength = trackProfile.length;
    var count = 0;

    trackProfile.forEach(function(track) {
      var match = track.spotifyId.match('^spotify\:track\:([0-9a-zA-Z]+)$');

      if (match) {
        tracks.getSpotifyTrackByID(match[1], req.user, function(item) {
          if (item) {
            userTracks.push(item);
          }

          count++;

          if (count >= profileLength) {
            res.json(userTracks);
          }
        });
      } else {
        profileLength--;
      }
    });

  } else {
    res.json('[]');
  }
};

/**
 * Add profileThreshold to user profile if not present
 */
exports.updateProfileThreshold = function(user) {
  if (!user.profileThreshold) {
    user.profileThreshold = globalConfig.ratingThreshold;
  }
};
