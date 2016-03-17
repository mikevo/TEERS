'use strict';

//Contexts service used to communicate Contexts REST endpoints
angular.module('recommendations').factory('Contexts', ['$resource',
	function($resource) {
		return $resource('/api/recommendations/contexts');
	}
]);
