'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
  _ = require('lodash');
var request = require('request');
var recommendations = require('./recommendations.server.controller');
var async = require('async');
var globalConfig = require('../../config.json');

/**
 * Search middleware
 */
exports.execute = function(req, res) {
  if (req.body && req.body.query) {
    var url = globalConfig.spotify.searchUrl + encodeURIComponent(req.body.query);

    var options = {
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    request(options, function(error, response, body) {
      // NOTE: handle error better
      if (!error && response.statusCode === 200) {
        var result = JSON.parse(body);

        var extendedResult = [];

				var tracks = [];

				for(var i = 0; i < globalConfig.spotify.maxNumOfSearchResults && i < result.tracks.items.length; i++) {
					tracks.push(result.tracks.items[i]);
				}

        var functionList = [];

        tracks.forEach(function(item, index, array) {
          // NOTE: should not be needed
          functionList.push(recommendations.extendRecommendation(item.uri, index, req.user.username, req.user.profile, extendedResult));
        });

				async.parallel(functionList, function(err, result) {
					if (err) {
						var searchList = [];

						extendedResult.forEach(function(item, index, array) {
							if (item !== null) {
								searchList.push(item);
							}

							if (index >= array.length - 1) {
								res.jsonp(searchList);
							}
						});
					} else {
						res.jsonp(extendedResult);
					}
				});
      } else {
        res.status(response.statusCode).send({
          message: 'Request Failed'
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'no query string contained'
    });
  }
};
