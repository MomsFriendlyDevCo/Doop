angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('users-list', {
				url: '/users',
				component: 'usersListCtrl',
				data: {
					title: 'Manage Users',
				},
			})
	})
	.component('usersListCtrl', {
		templateUrl: '/units/users/list.tmpl.html',
		controller: function($scope, $location, $loader, $timeout, $toast, Users) {
			var $ctrl = this;

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

			$scope.$evalAsync($ctrl.refresh);
		},
	});
