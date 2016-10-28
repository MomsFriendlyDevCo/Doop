angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: '/app/units/login/login.tmpl.html',
				controller: 'LoginCtrl as vm',
				data: {
					// Put custom data to expose to controllers here
				},
			});
	});
