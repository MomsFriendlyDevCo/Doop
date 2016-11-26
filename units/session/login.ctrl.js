angular
	.module('app')
	.run($router => $router.when('/login').title('Login').component('sessionLoginCtrl'))
	.component('sessionLoginCtrl', {
		templateUrl: '/units/session/login.tmpl.html',
		controller: function($animate, $rootScope, $session) {
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

						$animate.addClass(angular.element('.lcb-form'), 'shake')
							.then(_=> $animate.removeClass(angular.element('.lcb-form'), 'shake'))
					});
			};
		},
	});
