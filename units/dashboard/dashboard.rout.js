angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('dashboard', {
				url: '/',
				templateUrl: '/units/dashboard/dashboard.tmpl.html',
				data: {
					title: 'Dashboard',
				},
			});
	});
