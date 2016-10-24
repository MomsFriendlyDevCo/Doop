angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('profile', {
				url: '/profile',
				templateUrl: '/app/units/profile/profile.tmpl.html',
				controller: 'ProfileCtrl as vm',
				data: {
					// Put custom data to expose to controllers here
				},
			});
	});
