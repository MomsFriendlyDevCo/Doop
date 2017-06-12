angular
	.module('app')
	.run($router => $router.when('/login')
		.title('Login')
		.component('sessionLoginCtrl')
	)
	.component('sessionLoginCtrl', {
		templateUrl: '/units/session/login.tmpl.html',
		controller: function($animate, $config, $rootScope, $session) {
			var $ctrl = this;
			$ctrl.$config = $config;

			$ctrl.user = {
				username: '',
				password: '',
			};

			$ctrl.error;

			$ctrl.login = function(isValid) {
				if (!isValid) return;

				// Perform login
				$session.login(this.user)
					.catch(err => {
						$ctrl.error = _.get(err, 'data.error') || err.error || err || 'Could not login!';

						$animate.addClass(angular.element('.lcb-form'), 'shake')
							.then(()=> $animate.removeClass(angular.element('.lcb-form'), 'shake'))
					});
			};
		},
	});
