'use strict';

//Tracks service used to communicate Tracks REST endpoints
angular.module('users').factory('UserTracks', ['$resource',
	function($resource) {
		return $resource('api/users/me/tracks', {}, {		});
	}
]);
