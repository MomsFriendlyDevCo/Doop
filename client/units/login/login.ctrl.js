angular
	.module('app')
	.controller('LoginCtrl', function($scope, $state) {
		// Init scope variables
		this.user = { username: '', password: '' };

		this.login = function(isValid) {
			if (!isValid) return;

			// Perform login
			$scope.session.login(this.user)
				.then(res => {
					$scope.$broadcast('loginSuccess');
				})
				.catch(err => {
					$scope.$broadcast('loginFailure');
					// Handle login-specifc errors the server may throw
					if (err.error)
						console.error('Login error: ', res.error);
					else
						console.error('Error could not login!');
				});
		};
	});
