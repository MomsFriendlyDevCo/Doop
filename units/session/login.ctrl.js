angular
	.module('app')
	.run($router => $router.when('/login').component('sessionLoginCtrl'))
	.component('sessionLoginCtrl', {
		templateUrl: '/units/session/login.tmpl.html',
		controller: function($rootScope, $session) {
			var $ctrl = this;

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
		},
	});
