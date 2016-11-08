angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('session-logout', {
				url: '/logout',
				component: 'logoutCtrl',
				data: {
					title: 'Logout',
				},
			});
	})
	.component('logoutCtrl', {
		templateUrl: '/units/session/logout.tmpl.html',
		controller: function($session, $timeout, $window) {
			$timeout(function() { // Wait a second for everything to settle then logout
				$session.logout()
					.then(_=> $window.location = '/');
			}, 1000);
		},
	});
