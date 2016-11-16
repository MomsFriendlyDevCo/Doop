angular
	.module('app')
	.run($router => $router.when('/users/:id').component('usersEditCtrl'))
	.component('usersEditCtrl', {
		templateUrl: '/units/users/edit.tmpl.html',
		controller: function($location, $loader, $router, $scope, $session, $toast, Users) {
			var $ctrl = this;
			$ctrl.$session = $session;

			// Data refresher {{{
			$ctrl.meta;
			$ctrl.user;
			$ctrl.refresh = function() {
				$loader.start($scope.$id, $ctrl.user === undefined);

				Users.get({id: $router.params.id}).$promise
					.then(data => $ctrl.user = data)
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));

				if (!$ctrl.meta) // Not asked the server for meta data yet
					Users.meta().$promise.then(data => $ctrl.meta = data);
			};
			// }}}

			// Save {{{
			$ctrl.save = function() {
				$loader.start($scope.$id);
				Users.save({id: $router.params.id}, $ctrl.user).$promise
					.then(_=> $toast.success('User details saved'))
					.then(_=> $location.path('/users'))
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			// Password setting {{{
			$ctrl.passwordUnlock = false;
			$ctrl.togglePasswordUnlock = _=> $ctrl.passwordUnlock = !$ctrl.passwordUnlock;
			$ctrl.passwordGenerate = function() {
				$ctrl.passwordUnlock = true;
				$ctrl.user.password =
					_.sample(['alpha', 'beta', 'gamma', 'delta', 'zeta', 'theta', 'iota', 'kappa', 'sigma', 'omega']) +
					_.random(100,999);
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
