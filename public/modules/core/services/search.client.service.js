'use strict';

//Logs service used to communicate Logs REST endpoints
angular.module('core').factory('Search', ['$resource',
  function($resource) {
    return $resource('/api/search', {}, {
      load: {
        method: 'POST',
        isArray: true
      }
    });
  }
]);
