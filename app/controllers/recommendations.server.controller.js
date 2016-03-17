'use strict';

/**
 * Module dependencies.
 */
var async = require('async');
var request = require('request');
var tracks = require('./tracks.server.controller');
var logs = require('./logs.server.controller');
var globalConfig = require('../../config.json');

var startTimeRecSysLookup;
var startTimeRec;

var startRecSysLookupTimer = function() {
  startTimeRecSysLookup = process.hrtime();
};

var stopRecSysLookupTimer = function(user, size) {
  var endTimeRecSysLookup = process.hrtime(startTimeRecSysLookup);
  var elapsed = endTimeRecSysLookup[0] * 1000 + endTimeRecSysLookup[1] / 1000000; // divide by a million to get ms

  async.parallel([function(callback) {
    var data = {
      type: 'recSysLookupTime',
      time: elapsed,
      size: size,
      url: globalConfig.recSys.url
    };

    logs.add(user, 'performance', data);

    callback();
  }]);
};

var startRecommendationTimer = function() {
  startTimeRec = process.hrtime();
};

var stopRecommendationTimer = function(user, size) {
  var endTimeRec = process.hrtime(startTimeRec);
  var elapsed = endTimeRec[0] * 1000 + endTimeRec[1] / 1000000; // divide by a million to get ms

  async.parallel([function(callback) {
    var data = {
      type: 'recTime',
      time: elapsed,
      size: size
    };

    logs.add(user, 'performance', data);

    callback();
  }]);
};

/**
 * generates a like profile from the user profile
 * @param  {Object[]} from full user profiler from DB
 * @return {Object} containing two fields (all, like) which hold the full user
 *                  profile and the like profile
 */
exports.loadProfile = function(from, threshold) {
  var like = [];

  from.forEach(function(item) {
    like.push({
      'spotifyId': item.spotifyId,
      'rating': item.ratingValue
    });
  });

  return {
    'all': from,
    'like': like
  };
};

/**
 * Generates a Profile as needed by the recommender system API
 * @param  {User} user the requesting user
 * @param  {string} context the context used by for the request
 * @param  {string} type the type of recommendations
 * @param  {string} numOfRecs the number of recommendations returned
 * @return {Object} user profile needed for rec sys API
 */
exports.genRecApiProfile = function(user, context, numOfRecs, type) {
  // set default values
  type = typeof type !== 'undefined' ? type : GLOBAL.defaultTypeOfRecs;
  numOfRecs = typeof numOfRecs !== 'undefined' ? numOfRecs : globalConfig.recSys.numOfRecs.toString();

  return {
    'userId': user.username,
    'type': globalConfig.recSys.recType,
    'context': context,
    'recs': numOfRecs,
    'questionnaire': user.questionnaire,
    'profile': user.profile
  };
};

/**
 * List of Recommendations
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

  var userProfile = module.exports.genRecApiProfile(req.user, req.body.context);

  module.exports.queryRecommendations(userProfile, req.user.profileThreshold, function(recommendedTracks) {
    async.parallel([function(callback) {
      var data = {
        type: 'internal',
        ref: req.originalUrl,
        responseData: recommendedTracks,
        status: 'SUCCESS',
        statusCode: res.statusCode
      };

      logs.add(req.user, 'api_response', data);
    }]);

    res.jsonp(recommendedTracks);
  });
};

exports.extendRecommendation = function(item, index, userId, fullProfile, outputArray) {
  return function(callback) {
    var id;

    if (globalConfig.spotify.regex && (typeof item === 'string')) {
      var match = item.match(globalConfig.spotify.regex);

      if (match) {
        id = match[1];
      }
    } else {
      id = item;
    }

    if (id !== null) {
      tracks.getSpotifyTrackByID(id, {
        'username': userId,
        'profile': fullProfile
      }, function(track) {
        if (track) {
          if (track.album.images.length > 0) {
            track.albumImg = track.album.images[1].url;

            if (!track.albumImg) {
              track.albumImg = track.album.images[0].url;
            }

            if (!track.albumImg) {
              track.albumImg = track.album.images[2].url;
            }

            if (!track.albumImg) {
              track.albumImg = '/modules/core/img/noCover.png';
            }
          } else {
            track.albumImg = '/modules/core/img/noCover.png';
          }

          outputArray[index] = track;
          callback(null, track);
        } else {
          outputArray[index] = null;
          callback(true);
        }
      });
    } else {
      outputArray[index] = null;
      callback(true);
    }
  };
};

/**
 * loads recommendations form recommender system and fetches track info from
 * spotify api
 */
exports.queryRecommendations = function(userProfile, userThreshold, callback) {
  async.parallel([function(callback) {
    callback(null, module.exports.loadProfile(userProfile.profile, userThreshold));
  }], function(err, result) {
    var profile = result[0];

    userProfile.profile = profile.like;

    var req = {
      'auth': {
        'user': globalConfig.recSys.user,
        'pass': globalConfig.recSys.password,
        'sendImmediately': true
      },
      method: 'POST',
      url: globalConfig.recSys.url,
      body: JSON.stringify(userProfile),
      headers: {
        'content-type': globalConfig.recSys.contentType
      }
    };

    async.parallel([function(callback) {
      var data = {
        type: 'external',
        ref: req.url,
        method: req.method,
        requestData: userProfile
      };

      logs.add({
        username: userProfile.userId
      }, 'api_request', data);
      callback();
    }]);

    startRecommendationTimer();
    startRecSysLookupTimer();
    request(req,
      function(err, response, body) {
        if (!err && response.statusCode === 200) {
          var recommendation = JSON.parse(body);
          var numOfRecommendations = recommendation.recommendations.length;
          var count = 0;

          async.parallel([
            function(callback) {
              var data = {
                type: 'external',
                ref: response.request.href,
                responseData: recommendation,
                status: 'SUCCESS',
                statusCode: response.statusCode
              };

              logs.add({
                username: userProfile.userId
              }, 'api_response', data);

              callback();
            }
          ]);

          stopRecSysLookupTimer({
            username: userProfile.userId
          }, numOfRecommendations);

          var recommendedTracks = [];
          var insertPos = 0;

          var functionList = [];

          recommendation.recommendations.forEach(function(item, index, array) {
            functionList.push(module.exports.extendRecommendation(item, index, userProfile.userId, profile.all, recommendedTracks));
          });

          async.parallel(functionList, function(err, result) {
            if (err) {
              var recList = [];

              recommendedTracks.forEach(function(item, index, array) {
                if (item !== null) {
                  recList.push(item);
                }

                if (index >= array.length - 1) {
                  stopRecommendationTimer({
                    username: userProfile.userId
                  }, recList.length);
                  callback(recList);
                }
              });
            } else {
              stopRecommendationTimer({
                username: userProfile.userId
              }, recommendedTracks.length);
              callback(recommendedTracks);
            }
          });
        } else {
          async.parallel([function(callback) {
            var dataError = {
              type: 'external',
              ref: req.url,
              responseData: err,
              status: 'ERROR',
              statusCode: 0
            };

            logs.add({
              username: userProfile.userId
            }, 'api_response', dataError);

            callback();
          }]);
        }
      });
  });
};

/**
 * Get list of contexts form recsys
 */
exports.getContexts = function(req, res) {
  var contextReq = {
    'auth': {
      'user': globalConfig.recSys.user,
      'pass': globalConfig.recSys.password,
      'sendImmediately': true
    },
    method: 'GET',
    url: globalConfig.recSys.contextsUrl,
    headers: {
      'content-type': globalConfig.recSys.contentType
    }
  };

  request(contextReq,
    function(err, response, body) {
      var result = {};

      if (!err && response.statusCode === 200) {
        var contexts = JSON.parse(body);

        result.defaultContext = contexts[0].context;
        result.contexts = [];

        contexts.forEach(function(elem, index, array) {
          result.contexts[index] = elem.context;
        });
      } else {
        result.defaultContext = globalConfig.recSys.defaultContext;
        result.contexts = [globalConfig.recSys.defaultContext];
      }

      res.jsonp(result);
    });
};
