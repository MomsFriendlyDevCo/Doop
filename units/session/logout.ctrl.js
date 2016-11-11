angular
	.module('app')
	.run($router => $router.when('/logout').component('logoutCtrl'))
	.component('logoutCtrl', {
		templateUrl: '/units/session/logout.tmpl.html',
		controller: function($session, $timeout, $window) {
			$timeout(function() { // Wait a second for everything to settle then logout
				$session.logout()
					.then(_=> $window.location = '/');
			}, 1000);
		},
	});
