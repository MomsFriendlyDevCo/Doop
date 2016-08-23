angular
	.module('app')
	.controller('ProfileCtrl', function($scope, SessionServ) {
		this.refresh = function() {
			SessionServ.update();
		};

		$scope.$evalAsync(this.refresh);

		// Init scope variables
	});
