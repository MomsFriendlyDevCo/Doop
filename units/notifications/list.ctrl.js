angular
	.module('app')
	.run(($router, $session) => $router.when('/notifications').require($session.promise.admin).component('notificationsListCtrl'))
	.component('notificationsListCtrl', {
		templateUrl: '/units/notifications/list.tmpl.html',
		controller: function($scope, $location, $loader, $toast, Notifications) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.notifications;
			$ctrl.refresh = function() {
				$loader.start($scope.$id, $ctrl.notifications === undefined);

				Notifications.query().$promise
					.then(data => $ctrl.notifications = data)
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			// Notification deleter {{{
			$ctrl.delete = function(id) {
				$loader.start($scope.$id);

				Notifications.delete({id: id}).$promise
					.then($ctrl.refresh)
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
