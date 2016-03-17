'use strict';

// Tracks controller
angular.module('tracks').controller('TracksController', [
  '$scope', '$rootScope', '$stateParams', '$location', '$cacheFactory', 'Authentication', 'Tracks', 'Rating', 'Logger', 'Config', 'Search', '$sce',
  function($scope, $rootScope, $stateParams, $location, $cacheFactory, Authentication, Tracks, Rating, Logger, Config, Search, $sce) {
    $scope.authentication = Authentication;
    $rootScope.user = Authentication.user;

    // If user is not signed in then redirect to login
    if (!$rootScope.user) $location.path('/signin');

    if (angular.isUndefined($cacheFactory.get('recommendation'))) {
      $cacheFactory('recommendation');
    }

    var cache = $cacheFactory.get('recommendation');

    var count = 0;

    function getNumOfTracks() {
      if (count <= 0) {
        for (var i = 0; i < $rootScope.user.profile.length; i++) {
          if ($rootScope.user.profile[i].ratingValue >= $rootScope.user.profileThreshold) {
            count++;
          }
        }
      }

      return count;
    }

    function updateNumOfTracks() {
      Config.load(function(config) {
        $scope.progressColorClass = 'progress-bar';

        if (config.profile.minSize <= getNumOfTracks()) {
          $scope.numOfNeededTracks = 0;
          $scope.profileCompleteProgress = 100;

          if (getNumOfTracks() < config.profile.wantedSize) {
            $scope.trafficLightColor = 'yellow';
          } else {
            $scope.trafficLightColor = 'green';
          }

          if (!$scope.enoughTracks) {
            $rootScope.user.profileComplete = true;
            $scope.enoughTracks = true;
          }
        } else {
          $scope.trafficLightColor = 'red';
          $scope.progressColorClass = 'progress-bar progress-bar-danger';
        }

        if (config.profile.wantedSize >= getNumOfTracks()) {
          $scope.profileCompleteProgress = getNumOfTracks() / config.profile.wantedSize * 100;
        } else {
          $scope.profileCompleteProgress = 100;
        }
      });
    }

    $scope.logLink = function(href) {
      Logger.logLink($scope.place, href);
    };

    Config.load(function(config) {
      $scope.numOfNeededTracks = config.profile.minSize - getNumOfTracks();
    });

    $scope.enoughTracks = $rootScope.user.profileComplete;

    updateNumOfTracks();

    $scope.hidden = [];
    var showPos = -1;

    // Find a list of Tracks
    $scope.find = function() {
      $scope.loadingComplete = false;

      $scope.place = 'track_selector';

      var prevPlace = '';

      if (!angular.isUndefined(cache.get('prevPlace'))) {
        prevPlace = cache.get('prevPlace');
      }

      cache.put('prevPlace', $scope.place);
      Config.load(function(config) {
        $scope.tracks = Tracks.query(function() {
          // update preview urls so they can be used in iframe
          var arrayLength = $scope.tracks.length;
          for (var i = 0; i < arrayLength; i++) {
            var url = $sce.trustAsResourceUrl($scope.tracks[i].preview_url);
            if (!url) {
              Logger.logPreview($scope.place, $scope.tracks[i].uri, i, arrayLength, 0, 'no_preview_available');
            }
            $scope.tracks[i].preview_url = url;

            if (i < config.views.tracks.display) {
              $scope.hidden[i] = false;
            } else {
              $scope.hidden[i] = true;
            }
          }
          $scope.loadingComplete = true;
        });
      });
    };

    // Find existing Track
    $scope.findOne = function() {
      $scope.loadingComplete = false;
      $scope.place = 'track_detail';

      var prevPlace = cache.get('prevPlace');
      cache.put('prevPlace', $scope.place);

      $scope.track = Tracks.get({
        trackId: $stateParams.trackId
      }, function() {
        var url = $sce.trustAsResourceUrl($scope.track.preview_url);
        if (!url) {
          Logger.logPreview($scope.place, $scope.track.uri, 0, 1, 0, 'no_preview_available');
        }
        $scope.track.preview_url = url;

        Config.load(function(config) {
          if (!config.profile.starRating) {
            if (Rating.isLike($scope.track.rating)) {
              $scope.greenselected = 'thumbup-selected';
            } else {
              $scope.greenselected = 'thumb';
            }

            if (Rating.isDislike($scope.track.rating)) {
              $scope.redselected = 'thumbdown-selected';
            } else {
              $scope.redselected = 'thumb';
            }
          }

          $scope.loadingComplete = true;
        });
      });

    };

    $scope.search = function() {
      $scope.loadingComplete = false;
      $scope.place = 'track_search';

      $scope.tracks = Search.load({
        'query': $scope.searchQuery
      }, function() {
        // update preview urls so they can be used in iframe
        var arrayLength = $scope.tracks.length;
        for (var i = 0; i < arrayLength; i++) {
          var url = $sce.trustAsResourceUrl($scope.tracks[i].preview_url);
          if (!url) {
            Logger.logPreview($scope.place, $scope.tracks[i].uri, i, arrayLength, 0, 'no_preview_available');
          }
          $scope.tracks[i].preview_url = url;
        }
        $scope.loadingComplete = true;
      });
    };
    
    $scope.addStarRating = function(value, index) {
      $scope.addRating(index, value, $scope.place);

      if (Rating.isLike(value)) {
        $scope.numOfNeededTracks--;
        updateNumOfTracks();
      }

      $scope.find();
    };

    $scope.like = function(index) {
      $scope.addRating(index, 10);

      $scope.numOfNeededTracks--;
      updateNumOfTracks();
      $scope.find();
    };

    $scope.dislike = function(index) {
      $scope.addRating(index, 0);
      if (index === $rootScope.nowPlayingIndex) {
        $rootScope.nowPlaying.pause();
      }

      $scope.find();
    };

    var updateRecsInCache = function(id, value) {
      if (!angular.isUndefined(cache.get('recs'))) {
        var recs = cache.get('recs');

        var arrayLength = recs.length;
        for (var i = 0; i < arrayLength; i++) {
          if (recs[i].id === id) {
            recs[i].rating = value;
            recs[i].inUserProfile = true;
            cache.put('recs', recs);
            break;
          }
        }
      }
    };

    $scope.addStarRatingDetail = function(value) {
      Logger.logRating($scope.place, $scope.track.uri, 0, 1, value);
      Rating.addRatingToTrack($scope.track, value, $scope.place);
      updateRecsInCache($scope.track.id, value);
    };

    $scope.likeDetail = function() {
      $scope.redselected = 'thumb';
      $scope.greenselected = 'thumbup-selected';
      var value = 10;
      Logger.logRating($scope.place, $scope.track.uri, 0, 1, value);
      Rating.addRatingToTrack($scope.track, value, $scope.place);
      updateRecsInCache($scope.track.id, value);
    };

    $scope.dislikeDetail = function() {
      $scope.redselected = 'thumbdown-selected';
      $scope.greenselected = 'thumb';
      var value = 0;
      Logger.logRating($scope.place, $scope.track.uri, 0, 1, value);
      Rating.addRatingToTrack($scope.track, value, $scope.place);
      updateRecsInCache($scope.track.id, value);
    };

    $scope.addRating = function(index, value) {
      var track = $scope.tracks[index];

      if (Rating.isLike(value)) {
        count = 0;
      }

      Config.load(function(config) {
        Logger.logRating($scope.place, track.uri, index, config.views.tracks.display, value);
      });

      Rating.addRatingToTrack(track, value, $scope.place);
      updateRecsInCache(track.id, value);
    };

    $scope.refresh = function() {
      $scope.find();
    };
  }
]);
