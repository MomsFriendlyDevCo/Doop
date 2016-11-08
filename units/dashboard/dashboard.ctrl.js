angular
	.module('app')
	.controller('DashCtrl', function($scope, $auth, $state) {
		var self = this;

		// Define visibility control for this controller
		$auth.ensureAuthenticated();

		// Init scope variables
		this.message = 'Welcome to the dashboard!';

		this.refresh = function() {
			// return $promise
		};

		$scope.$evalAsync(this.refresh);
	});
