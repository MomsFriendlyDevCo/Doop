angular
	.module('app')
	.controller('LoginCtrl', function($scope, $state) {

		this.checkLogin = function() {
			// Redirect to dashboard if user is already logged in
			if ($scope.session && $scope.session.isLoggedIn) {
				$state.go('dashboard');
			}
		};

		this.login = function(isValid) {
			if (!isValid) return;

			// Perform login
			console.info('Performing login...', this.user); // FIXME: Debug log
			$scope.session.login(this.user)
				.then(res => {
					// FIXME: handle success case
				})
				.catch(err => {
					// Handle login-specifc errors the server may throw
					if (err.error)
						console.error('Login error: ', res.error);
					else
						console.error('Error could not login!');
				});
		};

		// Init scope variables
		this.user = { username: '', password: '' };

		this.checkLogin();
	});
