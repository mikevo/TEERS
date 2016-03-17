'use strict';

/* globals getExampleUser */
/* globals getSampleTrack */
/* globals getConfig */

(function() {
	// User Controller Spec
	describe('User Controller Tests', function() {
		// Initialize global variables
		var UserController,
			AuthenticationController,
			scope,
			rootScope,
			sce,
			$httpBackend,
			$stateParams,
			$location,
			user,
			sampleTrack,
			sampleTracks,
			userProfile,
			eventFired;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, $sce) {
			// Set a new global scope
			scope = $rootScope.$new();
			rootScope = $rootScope;
			sce = $sce;

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Authentication controller
			AuthenticationController = $controller('AuthenticationController', {
				$scope: scope
			});

			this.authUser = function() {
				$httpBackend.when('POST', '/auth/signin').respond(200, user);
				scope.signin();
				$httpBackend.flush();
			};

			this.loadTracks = function() {
				// Create a sample tracks array
				sampleTracks = [sampleTrack];

				// Set GET response
				$httpBackend.expectGET('api/users/me/tracks').respond(200, sampleTracks);

				scope.listTracks();

				$httpBackend.flush();
			};

			this.init = function() {
				// Initialize the user controller.
				UserController = $controller('UserController', {
					$scope: scope,
					$rootScope: rootScope
				});
			};

			this.prepareTest = function() {
				this.authUser();
				this.init();
				this.loadTracks();
			};

			this.prepareEventHandler = function(fired, profile) {
				eventFired = false;
				rootScope.$on('updateUserProfileEvent', function(event, args) {
					userProfile = args.user;
					eventFired = true;
				});
			};

			this.checkEventHandlerCall = function(value) {
				expect(eventFired).toBe(true);

				//run code to test
				userProfile.profile.forEach(function(elem, index, array) {
					if (elem.spotifyId === sampleTrack.uri) {
						expect(elem.ratingValue).toBe(value);
						expect(elem.addedAt).toBe('user_track_profile');
					}
				});
			};

		}));

		beforeEach(function() {
			user = getExampleUser();
			// Create sample tracks using the track service
			sampleTrack = getSampleTrack();
		});

		beforeEach(function() {
			$httpBackend.expectGET('i18n/locale-en.json').respond(200, {});

			$httpBackend.when('GET', '/api/config').respond(200, getConfig());
		});

		it('$scope.like() should set value 10', inject(function() {
			spyOn(rootScope, '$broadcast').and.callThrough();

			this.prepareTest();
			this.prepareEventHandler();

			scope.like(0);

			this.checkEventHandlerCall(10);
		}));

		it('$scope.dislike() should set value 0', inject(function() {
			spyOn(rootScope, '$broadcast').and.callThrough();

			this.prepareTest();
			this.prepareEventHandler();

			scope.dislike(0);

			this.checkEventHandlerCall(0);
		}));
	});
}());
