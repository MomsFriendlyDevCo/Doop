angular
	.module('app')
	.controller('LoginCtrl', function($scope, $state, AuthServ) {
		// Define visibility control for this controller
		AuthServ.ensureUnauthenticated();

		// Init scope variables
		this.user = { username: '', password: '' };

		this.login = function(isValid) {
			if (!isValid) return;

			// Perform login
			$scope.session.login(this.user)
				.then(res => {
					$scope.$emit('loginSuccess');
				})
				.catch(err => {
					$scope.$emit('loginFailure');
					// Handle login-specifc errors the server may throw
					if (err.error)
						console.error('Login error: ', res.error);
					else
						console.error('Error could not login!');
				});
		};
	});
