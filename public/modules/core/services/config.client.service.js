'use strict';

//Configs service used to communicate Configs REST endpoints
angular.module('core').factory('Config', ['$resource', '$cacheFactory',
  function($resource, $cacheFactory) {
    var loadFromBackend = function(callback) {
      $resource('/api/config', {}, {
        'load': {
          method: 'GET',
          isArray: false
        }
      }).load(callback);
    };

    return {
      load: function(callback) {
        if (angular.isUndefined($cacheFactory.get('config'))) {
          $cacheFactory('config');
        }

        var cache = $cacheFactory.get('config');

        if (angular.isUndefined(cache.get('globalConfig'))) {
          loadFromBackend(function(config) {
            cache.put('globalConfig', config);
            callback(config);
          });
        } else {
          callback(cache.get('globalConfig'));
        }
      }
    };
  }
]);
