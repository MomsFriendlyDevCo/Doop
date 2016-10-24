angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('dashboard', {
				url: '/',
				templateUrl: '/app/units/dashboard/dashboard.tmpl.html',
				controller: 'DashCtrl as vm',
				data: {
					// Put custom data to expose to controllers here
				},
			});
	});
