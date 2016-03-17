'use strict';

angular.module('core').directive('audioPreview', ['$rootScope', 'Logger',
	function($rootScope, Logger) {
		var addLog = function(scope, elem, eventType) {
			Logger.logPreview(scope.place, scope.track.uri, scope.index, scope.size, elem.context.currentTime, eventType);
		};

		return {
			restrict: 'AEC',
			template: '<div class="preview-missing" data-ng-hide="track.preview_url">' +
					'{{ \'NO_PREVIEW_AVAILABLE\' | translate }}' +
				'</div>' +
				'<div class="audio-player" data-ng-show="track.preview_url">' +
					'<audio data-ng-src="{{track.preview_url}}" controls> ' +
						'{{ \'NO_AUDIO_TAG_SUPPORT\' | translate }}' +
					'</audio>' +
				'</div>',
			scope: {
				place: '=',
				track: '=',
				index: '=',
				size: '='
			},
			link: function(scope, e, attrs) {
				var elem = angular.element(e.find('audio')[0]);

				elem.bind('play', function() {
					if ($rootScope.nowPlaying) {
						$rootScope.nowPlaying.pause();
					}

					$rootScope.nowPlaying = elem.context;
					$rootScope.nowPlayingIndex = scope.index;

					addLog(scope, elem, 'play');
				});

				elem.bind('pause', function() {
					if ($rootScope.nowPlaying === elem.context) {
						delete $rootScope.nowPlaying;
					}

					if ($rootScope.nowPlayingIndex === scope.index) {
						delete $rootScope.nowPlayingIndex;
					}

					addLog(scope, elem, 'pause');
				});

				elem.bind('ended', function() {
					if ($rootScope.nowPlaying === elem.context) {
						delete $rootScope.nowPlaying;
					}

					if ($rootScope.nowPlayingIndex === scope.index) {
						delete $rootScope.nowPlayingIndex;
					}

					addLog(scope, elem, 'ended');
				});


			}
		};
	}
]);
