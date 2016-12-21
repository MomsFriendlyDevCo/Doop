angular
	.module('app')
	.run($router => $router.when('/debug').title('Debug').component('debugCtrl'))
	.component('debugCtrl', {
		templateUrl: '/units/debug/debug.tmpl.html',
		controller: function($config, $loader, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
		},
	});
