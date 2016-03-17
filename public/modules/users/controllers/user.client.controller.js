'use strict';

// Tracks controller
angular.module('users').controller('UserController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'UserTracks', 'Rating', 'Logger', 'Config', '$sce', function($scope, $rootScope, $stateParams, $location, Authentication, UserTracks, Rating, Logger, Config, $sce) {
  $scope.authentication = Authentication;
  $rootScope.user = Authentication.user;

  // If user is not signed in then redirect to login
  if (!$rootScope.user) $location.path('/signin');
	$scope.loadingComplete = false;


  // Find a list of Tracks
  $scope.listTracks = function() {
    $scope.greenselected = [];
    $scope.redselected = [];
    $scope.loadingComplete = false;
    // If user is not signed in then redirect back home
    if (!$rootScope.user) $location.path('/signin');

    $scope.place = 'user_track_profile';

    $scope.tracks = UserTracks.query(function() {
      // update preview urls so they can be used in iframe
      var arrayLength = $scope.tracks.length;
      Config.load(function(config) {
        for (var i = 0; i < arrayLength; i++) {
          var url = $sce.trustAsResourceUrl($scope.tracks[i].preview_url);
          if (!url) {
            Logger.logPreview($scope.place, $scope.tracks[i].uri, i, arrayLength, 0, 'no_preview_available');
          }

          $scope.tracks[i].preview_url = url;

          if (!config.profile.starRating && $scope.recs[i].inUserProfile === true) {
            if (Rating.isLike($scope.tracks[i].rating)) {
              $scope.greenselected[i] = 'thumbup-selected';
            } else {
              $scope.greenselected[i] = 'thumb';
            }

            if (Rating.isDislike($scope.tracks[i].rating)) {
              $scope.redselected[i] = 'thumbdown-selected';
            } else {
              $scope.redselected[i] = 'thumb';
            }
          } else {
            $scope.greenselected[i] = 'thumb';
            $scope.redselected[i] = 'thumb';
          }
        }

        $scope.loadingComplete = true;
      });
    });
  };

  $scope.addStarRating = function(value, index) {
    $scope.addRating(index, value, $scope.place);
  };

  $scope.like = function(index) {
    $scope.redselected[index] = 'thumb';
    $scope.greenselected[index] = 'thumbup-selected';
    $scope.addRating(index, 10, $scope.place);
  };

  $scope.dislike = function(index) {
    $scope.redselected[index] = 'thumbdown-selected';
    $scope.greenselected[index] = 'thumb';
    $scope.addRating(index, 0, $scope.place);
  };

  $scope.addRating = function(index, value, addedAt) {
    var track = $scope.tracks[index];

    Logger.logRating(addedAt, track.uri, index, $scope.tracks.length, value);
    Rating.addRatingToTrack(track, value, addedAt);
  };
}]);
