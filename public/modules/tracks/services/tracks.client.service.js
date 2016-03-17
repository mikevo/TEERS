'use strict';

//Tracks service used to communicate Tracks REST endpoints
angular.module('tracks').factory('Tracks', ['$resource',
	function($resource) {
		return $resource('api/tracks/:trackId', { trackId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
