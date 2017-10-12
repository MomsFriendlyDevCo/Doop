angular
	.module('app')
	.run(($router, $session) => $router.when('/login/recover')
		.requires($session.promise.notLogin)
		.title('Recover Password')
		.component('sessionRecoverCtrl')
	)
	.component('sessionRecoverCtrl', {
		templateUrl: '/units/session/recover.tmpl.html',
		controller: function($rootScope, $config, $location, $session, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.error;
			$ctrl.user = {email: ''};

			$ctrl.$config.layout = {
				headerNavbar: false,
				sidebar: false,
				isImportant: true
			}


			$ctrl.recover = function(isValid) {
				if (!isValid) return;

				$session.recover(this.user.email)
					.then(()=> $toast.success('Password recovery email sent'))
					.then(()=> $location.path('/login'))
					.catch($toast.catch)
			};
		},
	});
