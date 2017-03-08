angular
	.module('app')
	.run($router => $router.when('/debug').title('Debug').component('debugCtrl'))
	.component('debugCtrl', {
		templateUrl: '/units/debug/debug.tmpl.html',
		controller: function($config, $loader, $router, $session, $toast, $tts) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$router = $router;
			$ctrl.$session = $session;
			$ctrl.$toast = $toast;
			$ctrl.$tts = $tts;
		},
	});
