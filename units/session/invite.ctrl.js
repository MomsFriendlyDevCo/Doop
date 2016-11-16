angular
	.module('app')
	.run($router => $router.when('/users/invite').component('sessionInviteCtrl'))
	.component('sessionInviteCtrl', {
		templateUrl: '/units/session/invite.tmpl.html',
		controller: function($scope, $loader, $location, $toast, Users) {
			var $ctrl = this;

			$ctrl.user = {email: ''};
			$ctrl.error;

			$ctrl.invite = function() {
				$loader.startBackground($scope.$id);

				Users.invite({
					emails: $ctrl.user.email.split(/[\s\n,]+/),
				}).$promise
					.then(_=> $loader.stop($scope.$id))
					.then(_=> $toast.success('Invites sent'))
					.then(data => $location.path('/users'))
					.catch(res => $ctrl.error = res.data.error);
			};
		},
	});
