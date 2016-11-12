angular
	.module('app')
	.run($router => $router.when('/users/:id').component('usersEditCtrl'))
	.component('usersEditCtrl', {
		templateUrl: '/units/users/edit.tmpl.html',
		controller: function($scope, $location, $loader, $router, $session, $timeout, $toast, Users) {
			var $ctrl = this;
			$ctrl.$session = $session;

			if (!$router.params.id) return $location.path('/');

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

			$scope.$evalAsync($ctrl.refresh);
		},
	});
