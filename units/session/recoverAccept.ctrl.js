angular
	.module('app')
	.run($router => $router.when('/login/recover/:token')
		.title('Recover Password')
		.component('sessionRecoverAcceptCtrl')
	)
	.component('sessionRecoverAcceptCtrl', {
		templateUrl: '/units/session/recoverAccept.tmpl.html',
		controller: function($scope, $location, $router, $toast, Users) {
			var $ctrl = this;

			$ctrl.error;
			$ctrl.user = {
				password: null,
				password2: null,
			};

			// Save {{{
			$ctrl.save = function() {
				$ctrl.error = null;
				if (!$ctrl.user.password) {
					$ctrl.error = 'You must specify a password';
				} else if (!$ctrl.user.password2) {
					$ctrl.error = 'You must confirm your password';
				} else if ($ctrl.user.password != $ctrl.user.password2) {
					$ctrl.error = 'Your passwords do not match';
				} else {
					Users.recoverAccept(_.merge({}, $ctrl.user, {token: $router.params.token})).$promise
						.then(_=> $toast.success('Your password has been saved'))
						.then(_=> $location.path('/login'))
						.catch($toast.catch)
				}
			};
			// }}}
		},
	});
