angular
	.module('app')
	.controller('DashCtrl', function($scope) {
		var self = this;

		this.refresh = function() {
			// return $promise
		};

		// Init scope variables
		this.message = 'Welcome to the dashboard!';

		$scope.$evalAsync(this.refresh);
	});
