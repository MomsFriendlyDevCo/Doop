angular
	.module('app')
	.controller('UsersListCtrl', function($scope, $location, $loader, $timeout, ToastsServ, UsersModl) {
		var $ctrl = this;

		// Data refresher {{{
		$ctrl.users;
		$ctrl.refresh = function() {
			$loader.start($scope.$id, $ctrl.users === undefined);

			UsersModl.query().$promise
				.then(data => $ctrl.users = data)
				.catch(ToastsServ.catch)
				.finally(() => $loader.stop($scope.$id));
		};
		// }}}

		$scope.$evalAsync($ctrl.refresh);
	});
