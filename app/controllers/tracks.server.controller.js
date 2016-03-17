'use strict';

/**
 * Module dependencies.
 */
var async = require('async');
var request = require('request');
var https = require('https');
var recommendations = require('./recommendations.server.controller');
var logs = require('./logs.server.controller');
var globalConfig = require('../../config.json');

var redis = require('redis');
var redisCache = redis.createClient();

var agent = new https.Agent({
  maxSockets: Infinity,
  keepAlive: true,
  keepAliveMsecs: 300000
});

var startTimeTrackLookup;

var startTrackLookupTimer = function() {
    startTimeTrackLookup = process.hrtime();
};

var stopTrackLookupTimer = function(user, id, hit) {
	var endTimeTrackLookup = process.hrtime(startTimeTrackLookup);
  var elapsed = endTimeTrackLookup[0] * 1000 + endTimeTrackLookup[1] / 1000000; // divide by a million to get ms

  async.parallel([function(callback) {
    var data = {
      type: 'trackLookupTime',
      time: elapsed,
			caching: globalConfig.spotify.cache.enable,
			cacheHit: hit,
      spotifyId: 'spotify:track:' + id
    };

    logs.add(user, 'performance', data);

    callback();
  }]);
};

/**
 * adds the user rating to a given track
 * @param  {Object[]} elem track to add rating information
 * @param  {[type]} userProfile profile to get rating from
 */
var addRating = function(elem, userProfile) {
  elem.rating = -1;
  elem.inUserProfile = false;

  // NOTE: performance bug if profile is huge
  for (var i = 0; i < userProfile.length; i++) {
    if (userProfile[i].spotifyId === elem.uri) {
      elem.rating = userProfile[i].ratingValue;
      elem.inUserProfile = true;
      break;
    }
  }
};

var loadTrackMetaInfoFromAPI = function(url, user, id, callback) {
  var req = {
    pool: agent,
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Connection':'keep-alive'
    }
  };

  request(req, function(error, response, body) {
    // NOTE: handle error better
    if (!error && response.statusCode === 200) {
      var track = JSON.parse(body);
      addRating(track, user.profile);

      if (globalConfig.spotify.log.enable) {
        async.parallel([function(callback) {
          var data = {
            type: 'external',
            ref: url,
            responseData: track,
            status: 'SUCCESS',
            statusCode: response.statusCode
          };
          logs.add(user, 'api_response', data);

          callback();
        }]);
      }

      if (globalConfig.spotify.cache.enable === true) {
        // use body instead of track because a string is needed
        async.parallel([function(callback) {
          redisCache.set(id, body);
          redisCache.expire(id, globalConfig.spotify.cache.expireTime);
          callback();
        }]);
      }

      stopTrackLookupTimer(user, id, false);
      callback(track);
    } else {
      if (globalConfig.spotify.log.enable) {
        async.parallel([function(callback) {
          var dataError = {
            type: 'external',
            ref: url,
            responseData: error,
            status: 'ERROR',
            statusCode: 0
          };

          logs.add(user, 'api_response', dataError);
          callback();
        }]);
      }
      callback();
    }
  });
};

/**
 * Show the current Track
 */
exports.read = function(req, res) {
  async.parallel([function(callback) {
    var data = {
      type: 'internal',
      ref: req.originalUrl,
      responseData: req.track,
      status: 'SUCCESS',
      statusCode: res.statusCode
    };

    logs.add(req.user, 'api_response', data);
    callback();
  }]);
  res.jsonp(req.track);
};

/**
 * Returns a list of tracks
 */
exports.list = function(req, res) {
  async.parallel([function(callback) {
    var data = {
      type: 'internal',
      ref: req.originalUrl,
      method: req.method,
      requestData: req.body
    };

    logs.add(req.user, 'api_request', data);
    callback();
  }]);

  var userProfile = recommendations.genRecApiProfile(req.user, globalConfig.recSys.defaultContext, globalConfig.recSys.numOfRecs);

  recommendations.queryRecommendations(userProfile, req.user.profileThreshold, function(tracks) {
    async.parallel([function(callback) {
      var data = {
        type: 'internal',
        ref: req.originalUrl,
        responseData: tracks,
        status: 'SUCCESS',
        statusCode: res.statusCode
      };

      logs.add(req.user, 'api_response', data);
      callback();
    }]);
    res.jsonp(tracks);
  });
};

/**
 * Track middleware
 */
exports.trackByID = function(req, res, next, id) {
  if (!id || !id.match(/^[0-9a-zA-Z]{22}$/)) {
    var errorMsg = 'Track id is invalid';
    var statusCode = 400;

    async.parallel([function(callback) {
      var dataError = {
        type: 'internal',
        ref: req.originalUrl,
        responseData: errorMsg,
        status: 'ERROR',
        statusCode: statusCode
      };

      logs.add({
        'username': 'SYSTEM'
      }, 'api_response', dataError);
      callback();
    }]);

    return res.status(statusCode).send(errorMsg);
  }

  module.exports.getSpotifyTrackByID(id, req.user, function(track) {
    if (!track) {
      var errorMsg = 'Failed to load Track ';
      var statusCode = 403;

      async.parallel([function(callback) {
        var dataError = {
          type: 'internal',
          ref: req.originalUrl,
          responseData: errorMsg,
          status: 'ERROR',
          statusCode: statusCode
        };

        logs.add({
          'username': 'SYSTEM'
        }, 'api_response', dataError);
        callback();
      }]);

      return res.status(statusCode).send('Failed to load Track ' + id);
    }

    req.track = track;
    next();
  });
};

exports.getSpotifyTrackByID = function(id, user, callback) {
  if (!user || !user.profile) {
    return callback();
  }

  var url = globalConfig.spotify.url + id;

  if (globalConfig.spotify.log.enable) {
    async.parallel([function(callback) {
      var data = {
        type: 'internal',
        ref: url,
        method: 'GET',
        requestData: {}
      };

      logs.add(user, 'api_request', data);
      callback();
    }]);
  }

  startTrackLookupTimer();

  if (globalConfig.spotify.cache.enable === true) {
    redisCache.get(id, function(err, cachedTrack) {
      if (cachedTrack) {
        var track = JSON.parse(cachedTrack);
        if (globalConfig.spotify.log.enable) {
          async.parallel([function(callback) {
            var data = {
              type: 'external',
              ref: url,
              responseData: track,
              status: 'SUCCESS',
              statusCode: 'cached'
            };
            logs.add(user, 'api_response', data);
            callback();
          }]);
        }

        stopTrackLookupTimer(user, id, true);
        addRating(track, user.profile);
        callback(track);
      } else {
        loadTrackMetaInfoFromAPI(url, user, id, callback);
      }
    });
  } else {
    loadTrackMetaInfoFromAPI(url, user, id, callback);
  }
};
