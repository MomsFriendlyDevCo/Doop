angular
	.module('app')
	.run(($router, $session) => $router.when('/users/:id').require($session.promise.admin).title('Edit User').component('usersEditCtrl'))
	.run(($router, $session) => $router.when('/users/create').require($session.promise.admin).title('Create User').component('usersEditCtrl'))
	.component('usersEditCtrl', {
		templateUrl: '/units/users/edit.tmpl.html',
		controller: function($location, $loader, $q, $router, $scope, $session, $toast, Users) {
			var $ctrl = this;
			$ctrl.$session = $session;

			// Data refresher {{{
			$ctrl.meta;
			$ctrl.user;
			$ctrl.refresh = function() {
				$loader.start($scope.$id, $ctrl.user === undefined);

				$q.all([
					Users.get({id: $router.params.id}).$promise
						.then(data => {
							data.dob = new Date(data.dob);
							$ctrl.user = data;
						})
						.catch(e => { if (e.status && e.status == 404) $location.path('/users') }),
				])
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
					.then(()=> $toast.success('User details saved'))
					.then(()=> $location.path('/users'))
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			// Password functionality {{{
			$ctrl.passwordUnlock = false;
			$ctrl.togglePasswordUnlock = ()=> $ctrl.passwordUnlock = !$ctrl.passwordUnlock;
			$ctrl.passwordGenerate = function() {
				$ctrl.passwordUnlock = true;
				$ctrl.user.password =
					_.sample(['alpha', 'beta', 'gamma', 'delta', 'zeta', 'theta', 'iota', 'kappa', 'sigma', 'omega']) +
					_.random(100,999);
			};

			$ctrl.sendResetEmail = function() {
				Users.recover({email: $ctrl.user.email}).$promise
					.then(()=> $toast.success('Password reset email sent to ' + $ctrl.user.email))
					.catch($toast.catch);
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
