angular
	.module('app')
	.run($router => $router.when('/debug').title('Debug').component('debugCtrl'))
	.component('debugCtrl', {
		templateUrl: '/units/debug/debug.tmpl.html',
		controller: function($scope, $loader, $toast) {
			var $ctrl = this;

			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
		},
	});
