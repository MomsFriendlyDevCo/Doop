/**
* Global app controller
*
* This controller should be the top-level controller in the app, with all
* other controllers existing as child controllers.
*/
angular
	.module('app')
	.controller('GlobalCtrl', function($rootScope, $scope, $state, SessionServ) {
		// Init user session object/data
		$scope.session = SessionServ;
	});
