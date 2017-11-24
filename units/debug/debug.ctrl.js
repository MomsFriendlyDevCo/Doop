angular
	.module('app')
	.run($router => $router.when('/debug').title('Debug').component('debugCtrl'))
	.component('debugCtrl', {
		templateUrl: '/units/debug/debug.tmpl.html',
		controller: function($config, $loader, $http, $q, $router, $session, $scope, $screen, $toast, $tts) {
			var $ctrl = this;
			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$router = $router;
			$ctrl.$session = $session;
			$ctrl.$screen = $screen;
			$ctrl.$toast = $toast;
			$ctrl.$tts = $tts;

			// Data refresher {{{
			$ctrl.version;
			$ctrl.refresh = ()=> {
				$loader.startBackground($scope.$id);

				$q.all([
					$http.get('/api/debug/live')
					.then(res => $ctrl.live = res.data),

					// Fetch version info
					$http.get('/api/debug/version')
						.then(res => $ctrl.version = res.data),
				])
					.catch($toast.catch)
					.finally($loader.stop($scope.$id));
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
	});
