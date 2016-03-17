'use strict';

//Recommendations service used to communicate Recommendations REST endpoints
angular.module('recommendations').factory('Recommendations', ['$resource',
	function($resource) {
		return $resource('/api/recommendations/:recommendationId', { recommendationId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			load: {
				method:'POST',
				isArray:true
			}
		});
	}
]);
