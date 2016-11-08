angular
	.module('app')
	.controller('LogoutCtrl', function($session, $timeout, $window) {
		$timeout(function() { // Wait a second for everything to settle then logout
			$session.logout()
				.then(_=> $window.location = '/');
		}, 1000);
	});
