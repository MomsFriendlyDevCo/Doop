angular
	.module('app')
	.controller('DashCtrl', function($scope, $state) {
		var self = this;

		// Init scope variables
		this.message = 'Welcome to the dashboard!';

		this.refresh = function() {
			// return $promise
		};

		$scope.$evalAsync(this.refresh);
	});
