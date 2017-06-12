angular
	.module('app')
	.run($router => $router.when('/login/recover')
		.title('Recover Password')
		.component('sessionRecoverCtrl')
	)
	.component('sessionRecoverCtrl', {
		templateUrl: '/units/session/recover.tmpl.html',
		controller: function($rootScope, $location, $session, $toast) {
			var $ctrl = this;
			$ctrl.error;
			$ctrl.user = {email: ''};

			$ctrl.recover = function(isValid) {
				if (!isValid) return;

				$session.recover(this.user.email)
					.then(()=> $toast.success('Password recovery email sent'))
					.then(()=> $location.path('/login'))
					.catch($toast.catch)
			};
		},
	});
