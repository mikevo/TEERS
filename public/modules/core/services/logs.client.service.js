'use strict';

//Logs service used to communicate Logs REST endpoints
angular.module('core').factory('Logs', ['$resource',
	function($resource) {
		return $resource('api/logs/:logId', { logId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
