'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication, $translate) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

	}
]);
