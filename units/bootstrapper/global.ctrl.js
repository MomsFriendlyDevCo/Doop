/**
* Global app controller
*
* This controller should be the top-level controller in the app, with all
* other controllers existing as child controllers.
*/
angular
	.module('app')
	.controller('GlobalCtrl', function($rootScope, $scope, $state, ConfigServ, SessionServ) {
		var $ctrl = this;
		// Init user session object/data
		$ctrl.config = ConfigServ;
		$ctrl.session = SessionServ;
		$ctrl.state = $state; // NOTE: To access the current state in a view use `$global.state.current`
	});
