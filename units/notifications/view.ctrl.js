angular
	.module('app')
	.run($router => $router.when('/notifications/:id').component('notificationsViewCtrl'))
	.component('notificationsViewCtrl', {
		templateUrl: '/units/notifications/view.tmpl.html',
		controller: function($location, $loader, $router, $scope, $toast, Notifications) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.notification;
			$ctrl.refresh = function() {
				$loader.start($scope.$id);

				Notifications.get({
					id: $router.params.id,
					populate: 'from',
				}).$promise
					.then(data => {
						$ctrl.notification = data;
					})
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			// Save {{{
			/**
			* Save a notification back
			* @param {Object} fields Fields to save
			*/
			$ctrl.save = function(fields) {
				$loader.startBackground($scope.$id);
				Notifications.save({id: $router.params.id}, fields).$promise
					.then(_=> $location.path('/notifications'))
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
