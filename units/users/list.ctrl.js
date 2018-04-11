angular
	.module('app')
	.run(($router, $session) => $router.when('/admin/users').require($session.promise.admin).title('Users').component('usersListCtrl'))
	.component('usersListCtrl', {
		templateUrl: '/units/users/list.tmpl.html',
		controller: function($scope, $location, $loader, $router, $session, $timeout, $toast, Users) {
			var $ctrl = this;
			$ctrl.$router = $router;
			$ctrl.$session = $session;

			// Data refresher {{{
			$ctrl.users;
			$ctrl.refresh = function() {
				$loader.start($scope.$id, $ctrl.users === undefined);

				var query = {
					sort: $router.query.sort || 'name',
				};

				if ($router.query.role) query.role = $router.query.role;

				Users.query(query).$promise
					.then(data => $ctrl.users = data)
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			// User deleter {{{
			$ctrl.delete = function(id) {
				$loader.start($scope.$id);

				Users.delete({id: id}).$promise
					.then($ctrl.refresh)
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			$scope.$watch(()=> $router.query, $ctrl.refresh, true);
			$scope.$evalAsync($ctrl.refresh);
		},
	});
