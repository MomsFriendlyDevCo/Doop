angular
	.module('app')
	.run($router => $router.when('/logout').title('Logout').component('sessionLogoutCtrl'))
	.component('sessionLogoutCtrl', {
		templateUrl: '/units/session/logout.tmpl.html',
		controller: function($session, $timeout, $window) {
			$timeout(function() { // Wait a second for everything to settle then logout
				$session.logout()
					.then(_=> $window.location = '/');
			}, 1000);
		},
	});
