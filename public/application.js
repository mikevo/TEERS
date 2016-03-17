'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$translateProvider',
	function($locationProvider, $translateProvider) {
		$locationProvider.html5Mode(true);

		$translateProvider.useStaticFilesLoader({
			prefix: 'i18n/locale-',
			suffix: '.json'
		});

		$translateProvider.preferredLanguage('en');
		$translateProvider.useLocalStorage();
		$translateProvider.useSanitizeValueStrategy('sanitize');
	}
]).run(['$rootScope', 'Config', function($rootScope, Config) {
	Config.load(function(config) {
		$rootScope.starRating = config.profile.starRating;
		$rootScope.starMaxRating = config.profile.starMaxRating;
	});
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
