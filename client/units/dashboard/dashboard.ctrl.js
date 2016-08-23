angular
	.module('app')
	.controller('DashCtrl', function($scope, $state) {
		var self = this;

		this.checkLogin = function() {
			// Redirect to dashboard if user is already logged in
			if ($scope.session && !$scope.session.isLoggedIn) {
				$state.go('login');
			}
		};

		this.refresh = function() {
			// return $promise
		};

		// Init scope variables
		this.message = 'Welcome to the dashboard!';

		this.checkLogin();

		$scope.$evalAsync(this.refresh);
	});
