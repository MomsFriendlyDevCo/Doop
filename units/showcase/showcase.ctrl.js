angular
	.module('app')
	.run($router => $router.when('/showcase/:id?').component('showcaseCtrl'))
	.component('showcaseCtrl', {
		templateUrl: '/units/showcase/showcase.tmpl.html',
		controller: function($scope, $config, $loader, $routerParams, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;

			// Jump to the right object ID if the $routerParams.id changes
			$scope.$watch(_=> $routerParams.id, function() {
				if ($routerParams.id) $(document).scrollTop($('#' + $routerParams.id.replace(/[^a-z0-9-]+/g, '_')).position().top - 100);
			});
		},
	});
