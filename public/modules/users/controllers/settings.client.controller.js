'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$rootScope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $rootScope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // If user is not signed in then redirect back home
    if (!$scope.user) $location.path('/');

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function(response) {
          $scope.success = true;
          Authentication.user = response;
          $rootScope.user = response;
        }, function(response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };

    // Change user password
    $scope.changeUserPassword = function() {
      $scope.success = $scope.error = null;

      $http.post('/api/users/password', $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };

    $scope.deleteTrackProfile = function() {
      $scope.user.deleteProfile = true;
      $scope.updateUserProfile(true);
    };

    var listener = $rootScope.$on('updateUserProfileEvent', function(event, args) {
      $scope.user = args.user;
      $scope.updateUserProfile(true);
    });

    $scope.$on('$destroy', function() {
      listener(); // remove listener.
    });
  }
]);
