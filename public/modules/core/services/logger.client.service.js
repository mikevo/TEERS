'use strict';

angular.module('core').factory('Logger', ['Logs',
	function(Logs) {
		return {
			logLink: function(addedAt, href) {
				var log = {
					'data': {
						'addedAt': addedAt,
						'href': href
					},
					'action': 'link_used'
				};

				var logEntry = new Logs(log);
				logEntry.$save();
			},
			logDetailView: function(addedAt, uri, index, size) {
				var log = {
					'data': {
						'addedAt': addedAt,
						'uri': uri,
						'index': index,
						'size': size
					},
					'action': 'detail_view'
				};

				var logEntry = new Logs(log);
				logEntry.$save();
			},
			logRating: function(addedAt, uri, index, size, value) {
				var log = {
					'data': {
						'addedAt': addedAt,
						'uri': uri,
						'index': index,
						'size': size,
						'ratingValue': value
					},
					'action': 'rating'
				};

				var logEntry = new Logs(log);
				logEntry.$save();
			},
			logPreview: function(addedAt, uri, index, size, currentTime, eventType) {
				var log = {
					'data': {
						'addedAt': addedAt,
						'uri': uri,
						'index': index,
						'size': size,
						'currentTime': currentTime,
						'event': eventType
					},
					'action': 'preview'
				};

				var logEntry = new Logs(log);
				logEntry.$save();
			}
		};
	}
]);
