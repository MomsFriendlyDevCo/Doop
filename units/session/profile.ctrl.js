angular
	.module('app')
	.run($router => $router.when('/profile').component('usersProfileCtrl'))
	.component('usersProfileCtrl', {
		templateUrl: '/units/session/profile.tmpl.html',
		controller: function($scope, $location, $loader, $session, $timeout, $toast, Users) {
			var $ctrl = this;

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
				$loader.start($scope.$id);
				Users.save({id: $session.data._id}, $ctrl.user).$promise
					.then(_=> $toast.success('Profile saved'))
					.then(_=> $location.path('/'))
					.then(_=> $session.update())
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
