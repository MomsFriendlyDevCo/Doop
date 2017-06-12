angular
	.module('app')
	.component('notificationsHeaderWidgetCtrl', {
		templateUrl: '/units/notifications/headerWidget.tmpl.html',
		controller: function($session, $scope, $timeout, $toast, Notifications) {
			var $ctrl = this;
			$ctrl.$session = $session;

			// Data refresher {{{
			$ctrl.autoRefreshInterval = 30 * 1000; // Refresh counts this number of MS (set to falsy to disable)
			$ctrl.autoRefreshHandle; // Refresh timer handle


			$ctrl.notificationCount;
			$ctrl.refreshCount = function() {
				if (!$session.isLoggedIn) return; // No user to query notifications of
				$timeout.cancel($ctrl.autoRefreshHandle);

				Notifications.count({status: 'active'}).$promise
					.then(data => $ctrl.notificationCount = data.count)
					.catch($toast.catch)
					.finally(()=> {
						if ($ctrl.autoRefreshInterval) 
							$ctrl.autoRefreshHandle = $timeout($ctrl.refreshCount, $ctrl.autoRefreshInterval)
					});
			};

			$ctrl.notifications;
			$ctrl.notificationsLoadedOnce = false; // Wheteher we have loaded the list for the first time
			$ctrl.notificationsLoading = false;

			/**
			* Refresh the notification list
			* @param {Object} [e] An optional $event object. If present the click event is canceled - this is to prevent the dropdown menu from closing when clicking on an entry
			*/
			$ctrl.refreshList = function(e) {
				if (e) e.stopPropagation();
				if (!$session.isLoggedIn) return; // No user to query notifications of
				$ctrl.notificationsLoading = true;

				Notifications.query({status: 'active', limit: 5}).$promise
					.then(data => $ctrl.notifications = data, 3000)
					.catch($toast.catch)
					.finally(()=> {
						$ctrl.notificationsLoading = false;
						$ctrl.notificationsLoadedOnce = true;
					});
			};
			// }}}

			$ctrl.markAllRead = function() {
				Notifications.markAsRead().$promise
					.catch($toast.catch)
					.finally($ctrl.refreshList)
			};

			$scope.$evalAsync($ctrl.refreshCount);
			$scope.$on('session.updated', $ctrl.refreshCount);
		},
	})
