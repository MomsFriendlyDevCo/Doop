angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('session-login', {
				url: '/login',
				templateUrl: '/units/session/login.tmpl.html',
				controller: 'LoginCtrl as $ctrl',
				data: {
					title: 'Login',
				},
			})
			.state('session-logout', {
				url: '/logout',
				templateUrl: '/units/session/logout.tmpl.html',
				controller: 'LogoutCtrl as $ctrl',
				data: {
					title: 'Logout',
				},
			})
	});
