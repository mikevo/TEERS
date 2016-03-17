'use strict';

/* globals getExampleUser */
/* globals getSampleTrack */
/* globals getConfig */

(function() {
  // Tracks Controller Spec
  describe('Tracks Controller Tests', function() {
    // Initialize global variables
    var TracksController,
      AuthenticationController,
      scope,
      rootScope,
      sce,
      $httpBackend,
      $stateParams,
      $location,
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
        var user = getExampleUser();

        // Test expected GET request
        $httpBackend.when('POST', '/auth/signin').respond(200, user);

        scope.signin();
        $httpBackend.flush();
      };

      this.loadTracks = function() {
        // Create a sample Tracks array that includes the new Track
        sampleTracks = [sampleTrack];

        // Set GET response
        $httpBackend.expectGET('api/tracks').respond(sampleTracks);

        // Run controller functionality
        scope.find();
        $httpBackend.flush();
      };

      this.loadTrack = function() {
        // Set the URL parameter
        $stateParams.trackId = '2LlvrdnLa3XbB1b4jYuCnl';

        // Set GET response
        $httpBackend.expectGET(/api\/tracks\/([0-9a-zA-Z]{22})$/).respond(sampleTrack);

        // Run controller functionality
        scope.findOne();
        $httpBackend.flush();
      };

      this.init = function() {
        // Initialize the Tracks controller.
        TracksController = $controller('TracksController', {
          $scope: scope,
          $rootScope: rootScope
        });
      };

      this.prepareFindTest = function() {
        this.authUser();
        this.init();
        this.loadTracks();
      };

      this.prepareFindOneTest = function() {
        this.authUser();
        this.init();
        this.loadTrack();
      };

      this.prepareEventHandler = function(fired, profile) {
        eventFired = false;
        rootScope.$on('updateUserProfileEvent', function(event, args) {
          userProfile = args.user;
          eventFired = true;
        });
      };

      this.checkEventHandlerCall = function(value, addedAt) {
        expect(eventFired).toBe(true);

        //run code to test
        userProfile.profile.forEach(function(elem, index, array) {
          if (elem.spotifyId === sampleTrack.uri) {
            expect(elem.ratingValue).toBe(value);
            expect(elem.addedAt).toBe(addedAt);
          }
        });
      };
    }));

    beforeEach(function() {
      sampleTrack = getSampleTrack();
    });

    beforeEach(function() {
      $httpBackend.expectGET('i18n/locale-en.json').respond(200, {});

      $httpBackend.when('GET', '/api/config').respond(200, getConfig());
    });

    it('$scope.find() should create an array with at least one Track object', inject(function(Tracks) {
      this.prepareFindTest();

      // trust preview_url as done by the controller. Needed to compare the
      // arrays
      for (var i = 0; i < sampleTracks.length; i++) {
        var url = sce.trustAsResourceUrl(sampleTracks[i].preview_url);
        sampleTracks[i].preview_url = url;
      }

      // Test scope value
      expect(scope.tracks).toEqualData(sampleTracks);
    }));

    it('$scope.findOne() should create one Track object fetched using a trackId URL parameter', inject(function(Tracks) {
      this.prepareFindOneTest();

      // trust preview_url as done by the controller. Needed to compare the
      // tracks
      var url = sce.trustAsResourceUrl(sampleTrack.preview_url);
      sampleTrack.preview_url = url;

      // Test scope value
      expect(scope.track).toEqualData(sampleTrack);
    }));


    it('$scope.addStarRating() should set correct value', inject(function() {
      spyOn(rootScope, '$broadcast').and.callThrough();

      this.prepareFindTest();
      this.prepareEventHandler();

      var ratingValue = 5;
      var index = 0;
      scope.addStarRating(ratingValue, index);

      this.checkEventHandlerCall(ratingValue, 'track_selector');
    }));

    it('$scope.like() should set value 10', inject(function() {
      spyOn(rootScope, '$broadcast').and.callThrough();

      this.prepareFindTest();
      this.prepareEventHandler();

      scope.like(0);

      this.checkEventHandlerCall(10, 'track_selector');
    }));

    it('$scope.dislike() should set value 0', inject(function() {
      spyOn(rootScope, '$broadcast').and.callThrough();

      this.prepareFindTest();
      this.prepareEventHandler();

      scope.dislike(0);

      this.checkEventHandlerCall(0, 'track_selector');
    }));

    it('$scope.addStarRatingDetail() should set correct value', inject(function() {
      spyOn(rootScope, '$broadcast').and.callThrough();

      this.prepareFindOneTest();
      this.prepareEventHandler();

      var ratingValue = 5;
      scope.addStarRatingDetail(ratingValue);

      this.checkEventHandlerCall(ratingValue, 'track_detail');
    }));

    it('$scope.likeDetail() should set value 10', inject(function() {
      spyOn(rootScope, '$broadcast').and.callThrough();

      this.prepareFindOneTest();
      this.prepareEventHandler();

      scope.likeDetail();

      this.checkEventHandlerCall(10, 'track_detail');
    }));

    it('$scope.dislikeDetail() should set value 0', inject(function() {
      spyOn(rootScope, '$broadcast').and.callThrough();

      this.prepareFindOneTest();
      this.prepareEventHandler();

      scope.dislikeDetail();

      this.checkEventHandlerCall(0, 'track_detail');
    }));

  });
}());
