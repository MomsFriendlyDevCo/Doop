angular
	.module('app')
	.run($router => $router.when('/invite/accept/:token').component('usersInviteAcceptCtrl'))
	.component('usersInviteAcceptCtrl', {
		templateUrl: '/units/session/inviteAccept.tmpl.html',
		controller: function($scope, $routerParams, $toast, $window, Users) {
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
					Users.inviteAccept(_.merge({}, $ctrl.user, {token: $routerParams.token})).$promise
						.then(_=> $window.location = '/')
						.catch($toast.catch)
				}
			};
			// }}}
		},
	});
