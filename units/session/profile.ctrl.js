angular
	.module('app')
	.run(($router, $session) => $router.when('/profile')
		.title('Profile')
		.requires($session.promise.login)
		.component('sessionProfileCtrl')
	)
	.component('sessionProfileCtrl', {
		templateUrl: '/units/session/profile.tmpl.html',
		controller: function($scope, $location, $loader, $session, $timeout, $toast, Users) {
			var $ctrl = this;
			$ctrl.error;

			// Data refresher {{{
			$ctrl.meta;
			$ctrl.user = $session.data;
			$ctrl.refresh = function() {
				if (!$ctrl.meta) { // Not asked the server for meta data yet
					$loader.start($scope.$id, $ctrl.user === undefined);

					Users.meta().$promise
						.then(data => $ctrl.meta = data)
						.finally(() => $loader.stop($scope.$id));
				}
			};
			// }}}

			// Save {{{
			$ctrl.save = function() {
				if ($ctrl.passwordUnlock && !$ctrl.user.password) {
					$ctrl.passwordUnlock = false;
					delete $ctrl.user.password;
					delete $ctrl.user.password2;
				} else if ($ctrl.user.password && $ctrl.user.password != $ctrl.user.password2) {
					$ctrl.error = 'Your passwords must match';
				} else {
					delete $ctrl.user.password2;

					$loader.start($scope.$id);
					Users.save({id: $session.data._id}, $ctrl.user).$promise
						.then(()=> $toast.success('Profile saved'))
						.then(()=> $location.path('/'))
						.then(()=> $session.update())
						.catch($toast.catch)
						.finally(() => $loader.stop($scope.$id));
				}
			};
			// }}}

			// Password setting {{{
			$ctrl.passwordUnlock = false;
			$ctrl.togglePasswordUnlock = ()=> $ctrl.passwordUnlock = !$ctrl.passwordUnlock;
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
