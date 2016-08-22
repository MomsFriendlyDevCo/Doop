/**
* Global app controller
*
* This controller should be the top-level controller in the app, with all
* other controllers existing as child controllers.
*/
(function() {
	angular
		.module('app')
		.controller('GlobalCtrl', function($rootScope, $scope, SessionServ) {

			/**
			 * Controller initialiser hook
			 */
			this.$onInit = function() {
				// Init scope variables
				$scope.session = SessionServ;
			};
		});
})();
