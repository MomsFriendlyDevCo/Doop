angular
	.module('app')
	.run($router => $router.when('/debug').title('Debug').component('debugCtrl'))
	.component('debugCtrl', {
		templateUrl: '/units/debug/debug.tmpl.html',
		controller: function($config, $loader, $http, $prompt, $q, $router, $session, $scope, $screen, $timeout, $toast, $tts, $filter, AssetTrees) {
			var $ctrl = this;
			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$prompt = $prompt;
			$ctrl.$router = $router;
			$ctrl.$session = $session;
			$ctrl.$screen = $screen;
			$ctrl.$toast = $toast;
			$ctrl.$tts = $tts;

			// Data refresher {{{
			$ctrl.version;
			$ctrl.refresh = ()=> {
				$loader.startBackground($scope.$id);

				return $q.all([
					// Always refresh live data
					$http.get('/api/debug/live')
						.then(res => $ctrl.live = res.data),

					// Fetch version info once
					!$ctrl.version
					? $http.get('/api/debug/version')
						.then(res => {
							$ctrl.version = res.data;
							$ctrl.version.package.updatedUtc = $ctrl.version.package.updated;
							$ctrl.version.package.updated = $filter('date')(new Date($ctrl.version.package.updated), 'long');
							$ctrl.version.git.dateUtc = $ctrl.version.git.date;
							$ctrl.version.git.date = $filter('date')(new Date($ctrl.version.git.date), 'long');
						})
					: undefined,
				])
					.catch($toast.catch)
					.finally($loader.stop($scope.$id))
			};
			// }}}

			// Auto-refresh functionality {{{
			$ctrl.refreshTimer;
			$ctrl.autoRefresh = false;
			$ctrl.autoRefreshWorker = ()=> {
				$timeout.cancel($ctrl.refreshTimer);
				$ctrl.refreshTimer = $timeout(()=> $ctrl.refresh().then(()=> $ctrl.autoRefreshWorker()), 1000);
			};

			$scope.$watch('$ctrl.autoRefresh', ()=> {
				$timeout.cancel($ctrl.refreshTimer);
				if ($ctrl.autoRefresh) $ctrl.autoRefreshWorker();
			});
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
