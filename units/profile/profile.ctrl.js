angular
	.module('app')
	.controller('ProfileCtrl', function($scope, SessionServ, AuthServ) {
		// Define visibility control for this controller
		AuthServ.ensureAuthenticated();

		// Init scope variables

		this.refresh = function() {
			SessionServ.update();
		};

		$scope.$evalAsync(this.refresh);

	});
