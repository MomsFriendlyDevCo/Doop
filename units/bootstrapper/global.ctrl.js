/**
* Global app controller
*
* This controller should be the top-level controller in the app, with all
* other controllers existing as child controllers.
*/
angular
	.module('app')
	.controller('GlobalCtrl', function($config, $rootScope, $scope, $session) {
		var $ctrl = this;
		// Init user session object/data
		$ctrl.config = $config;
		$ctrl.session = $session;
	});
