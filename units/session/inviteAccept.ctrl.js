angular
	.module('app')
	.run($router => $router.when('/invite/accept/:token').component('sessionInviteAcceptCtrl'))
	.component('sessionInviteAcceptCtrl', {
		templateUrl: '/units/session/inviteAccept.tmpl.html',
		controller: function($scope, $router, $toast, $window, Users) {
			var $ctrl = this;

			$ctrl.error;
			$ctrl.user = {
				name: null,
				password: null,
				password2: null,
			};

			// Save {{{
			$ctrl.save = function() {
				$ctrl.error = null;
				if (!$ctrl.user.name) {
					$ctrl.error = 'You must specify your name';
				} else if (!$ctrl.user.password) {
					$ctrl.error = 'You must specify a password';
				} else if (!$ctrl.user.password2) {
					$ctrl.error = 'You must confirm your password';
				} else if ($ctrl.user.password != $ctrl.user.password2) {
					$ctrl.error = 'Your passwords do not match';
				} else {
					Users.inviteAccept(_.merge({}, $ctrl.user, {token: $router.params.token})).$promise
						.then(()=> $window.location = '/')
						.catch($toast.catch)
				}
			};
			// }}}
		},
	});
