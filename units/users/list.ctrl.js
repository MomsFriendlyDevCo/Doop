angular
	.module('app')
	.run($router => $router.when('/users').component('usersListCtrl'))
	.component('usersListCtrl', {
		templateUrl: '/units/users/list.tmpl.html',
		controller: function($scope, $location, $loader, $session, $timeout, $toast, Users) {
			var $ctrl = this;
			$ctrl.$session = $session;

			// Data refresher {{{
			$ctrl.users;
			$ctrl.refresh = function() {
				$loader.start($scope.$id, $ctrl.users === undefined);

				Users.query().$promise
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

			$scope.$evalAsync($ctrl.refresh);
		},
	});
