'use strict';

//Setting up route
angular.module('recommendations').config(['$stateProvider',
	function($stateProvider) {
		// Recommendations state routing
		$stateProvider.
		state('listRecommendations', {
			url: '/recommendations',
			templateUrl: 'modules/recommendations/views/list-recommendations.client.view.html'
		});
	}
]);
