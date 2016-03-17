'use strict';

angular.module('users').factory('Rating', ['$rootScope', 'Authentication',
	function($rootScope, Authentication) {
		return {
			addRatingToTrack: function(track, value, addedAt) {
				var callingUser = Authentication.user;
				if (track.inUserProfile) {
					var profile = callingUser.profile;
					for (var i = 0; i < profile.length; i++) {
						if (profile[i].spotifyId === track.uri) {
							profile[i].ratingValue = value;
							profile[i].addedAt = addedAt;
							break;
						}
					}
				} else {
					var rating = {
						'spotifyId': track.uri,
						'ratingValue': value,
						'addedAt': addedAt
					};

					callingUser.profile.push(rating);
					track.rating = value;
					track.inUserProfile = true;
				}

				$rootScope.$broadcast('updateUserProfileEvent', {
					user: callingUser
				});
			},
			isLike: function(value) {
				return (value >= Authentication.user.profileThreshold);
			},
			isDislike: function(value) {
				return (value < Authentication.user.profileThreshold && value >= 0);
			}
		};
	}
]);
