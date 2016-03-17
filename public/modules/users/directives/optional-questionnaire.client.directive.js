'use strict';

angular.module('users').directive('optionalQuestionnaire', [
	function() {
		return {
			restrict: 'A',
			templateUrl: 'modules/users/views/directive-templates/optional-questionnaire.client.view.html',
			scope: {
				data: '='
			}
		};
	}
]);
