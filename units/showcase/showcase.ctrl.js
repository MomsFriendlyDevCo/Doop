angular
	.module('app')
	.run($router => $router.when('/showcase/:id?').component('showcaseCtrl'))
	.component('showcaseCtrl', {
		templateUrl: '/units/showcase/showcase.tmpl.html',
		controller: function($scope, $config, $loader, $router, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
			$ctrl.$router = $router;

			// Jump to the right object ID if the $router.params.id changes
			$scope.$watch(_=> $router.params.id, function() {
				if ($router.params.id) $(document).scrollTop($('#' + $router.params.id.replace(/[^a-z0-9-]+/g, '_')).position().top - 100);
			});
		},
	});
