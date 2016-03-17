'use strict';

// Recommendations controller
angular.module('recommendations').controller('RecommendationsController', ['$scope', '$rootScope', '$stateParams', '$location', '$cacheFactory', 'Authentication', 'Recommendations', 'Contexts', 'Rating', 'Logger', 'Config', '$sce',
  function($scope, $rootScope, $stateParams, $location, $cacheFactory, Authentication, Recommendations, Contexts, Rating, Logger, Config, $sce) {
    $scope.authentication = Authentication;
    $rootScope.user = Authentication.user;

    // If user is not signed in then redirect to login
    if (!$rootScope.user) $location.path('/signin');

    if (angular.isUndefined($cacheFactory.get('recommendation'))) {
      $cacheFactory('recommendation');
    }

    var cache = $cacheFactory.get('recommendation');

    // If user profile is incomplete then redirect to trackselector
    if (!$rootScope.user.profileComplete) {
      $location.path('/tracks');
    }
    // change when binded with data
    $scope.loadingComplete = false;

    $scope.place = 'recommendation';

    $scope.logDetailView = function(uri, index) {
      Logger.logDetailView($scope.place, uri, index, $scope.recs.length);
    };

    $scope.redirectTo = function(path) {
      $location.path(path);
    };

    $scope.recs = [];

    $scope.recContext = 'Please select';

    $scope.greenselected = [];
    $scope.redselected = [];

    var loadThumbRating = function(i) {
      Config.load(function(config) {
        if (!config.profile.starRating && $scope.recs[i].inUserProfile === true) {
          if (Rating.isLike($scope.recs[i].rating)) {
            $scope.greenselected[i] = 'thumbup-selected';
          } else {
            $scope.greenselected[i] = 'thumb';
          }

          if (Rating.isDislike($scope.recs[i].rating)) {
            $scope.redselected[i] = 'thumbdown-selected';
          } else {
            $scope.redselected[i] = 'thumb';
          }
        } else {
          $scope.greenselected[i] = 'thumb';
          $scope.redselected[i] = 'thumb';
        }
      });
    };

    $scope.updateContext = function(context) {
      Contexts.get({}, function(data) {
        if (!context) {
          context = data.defaultContext;
        }

        $scope.recContexts = data.contexts;

        var prevPlace = cache.get('prevPlace');
        cache.put('prevPlace', $scope.place);

        // check if context is contained in
        if ($.inArray(context, $scope.recContexts) !== -1) {
          $scope.loadingComplete = false;

          $scope.recContext = context;

          if ((prevPlace !== 'track_detail') || (angular.isUndefined(cache.get('recs')))) {
            $scope.recs = Recommendations.load({
              'context': context
            }, function() {
              // update preview urls so they can be used in iframe
              var arrayLength = $scope.recs.length;
              for (var i = 0; i < arrayLength; i++) {
                var url = $sce.trustAsResourceUrl($scope.recs[i].preview_url);
                if (!url) {
                  Logger.logPreview($scope.place, $scope.recs[i].uri, i, arrayLength, 0, 'no_preview_available');
                }
                $scope.recs[i].preview_url = url;

                loadThumbRating(i);
              }
              $scope.loadingComplete = true;
              cache.put('recs', $scope.recs);
            });
          } else {
            $scope.recs = cache.get('recs');
            Config.load(function(config) {
              if (!config.profile.starRating) {
                var arrayLength = $scope.recs.length;
                for (var i = 0; i < arrayLength; i++) {
                  loadThumbRating(i);
                }
              }
              $scope.loadingComplete = true;
            });
          }
        }
      });
    };

    $scope.addStarRating = function(value, index) {
      $scope.addRating(index, value, $scope.place);
    };

    $scope.like = function(index) {
      $scope.redselected[index] = 'thumb';
      $scope.greenselected[index] = 'thumbup-selected';
      cache.put('greenselected', $scope.greenselected);
      cache.put('redselected', $scope.redselected);
      $scope.addRating(index, 10, $scope.place);
    };

    $scope.dislike = function(index) {
      $scope.redselected[index] = 'thumbdown-selected';
      $scope.greenselected[index] = 'thumb';
      cache.put('greenselected', $scope.greenselected);
      cache.put('redselected', $scope.redselected);
      $scope.addRating(index, 0, $scope.place);
    };

    $scope.addRating = function(index, value, addedAt) {
      var track = $scope.recs[index];

      Logger.logRating(addedAt, track.uri, index, $scope.recs.length, value);
      Rating.addRatingToTrack(track, value, addedAt);
    };
  }
]);
