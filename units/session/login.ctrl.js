angular
	.module('app')
	.controller('LoginCtrl', function($rootScope, $session, $state, AuthServ) {
		var $ctrl = this;

		// Define visibility control for this controller
		AuthServ.ensureUnauthenticated();

		// Init scope variables
		this.user = { username: '', password: '' };

		// Messages
		$ctrl.error;

		$ctrl.login = function(isValid) {
			if (!isValid) return;

			// Perform login
			$session.login(this.user)
				.then(_=> $rootScope.$broadcast('loginSuccess'))
				.catch(err => {
					$rootScope.$broadcast('loginFailure');
					// Handle login-specifc errors the server may throw
					if (err.error) {
						$ctrl.error = res.error;
					} else {
						$ctrl.error = 'Could not login!';
					}
				});
		};
	});
