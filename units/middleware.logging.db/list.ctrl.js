angular
	.module('app')
	.run($router => $router.when('/admin/logs').title('Logs').component('logListCtrl'))
	.component('logListCtrl', {
		templateUrl: '/units/middleware.logging.db/list.tmpl.html',
		controller: function($scope, $loader, $toast, Logs, Users) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.query = {
				limit: 100,
				sort: '-created',
			};

			$ctrl.logs;
			$ctrl.logEntry; // Focused log entry (on click)
			$ctrl.users = {}; // Cached list of basic user info (by _id)
			$ctrl.refresh = function() {
				$loader.start($scope.$id, $ctrl.logs === undefined);

				Logs.query($ctrl.query).$promise
					.then(data => $ctrl.logs = data)
					.then(()=> {
						var fetchUsers = $ctrl.logs
							.filter(l => !! l.user)
							.map(l => l.user);

						if (fetchUsers) return Users.query({
							_id: fetchUsers,
							select: '_id,email,name',
						}).$promise
							.then(data => data.forEach(u => $ctrl.users[u._id] = u));
					})
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};

			$ctrl.viewEntry = entry => {
				$loader.startBackground($scope.$id);

				Logs.get({id: entry._id}).$promise
					.then(data => $ctrl.logEntry = entry)
					.then(()=> $('#modal-log-entry').modal('show'))
					.catch($toast.catch)
					.finally(() => $loader.stop($scope.$id));
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	})