angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('users-inviteAccept', {
				url: '/invite/accept/:token',
				component: 'usersInviteAcceptCtrl',
				data: {
					title: 'Accept Invite',
				},
			})
	})
	.component('usersInviteAcceptCtrl', {
		templateUrl: '/units/session/inviteAccept.tmpl.html',
		controller: function($scope, $stateParams, $toast, $window, Users) {
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
					Users.inviteAccept(_.merge({}, $ctrl.user, {token: $stateParams.token})).$promise
						.then(_=> $window.location = '/')
						.catch($toast.catch)
				}
			};
			// }}}
		},
	});
