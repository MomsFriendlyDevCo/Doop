angular
	.module('app')
	.controller('LogoutCtrl', function(SessionServ, $timeout, $window) {
		$timeout(function() { // Wait a second for everything to settle then logout
			SessionServ.logout()
				.then(res => {
					$window.location = '/';
				});
		}, 1000);
	});
