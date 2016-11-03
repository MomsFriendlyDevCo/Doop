angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('profile', {
				url: '/profile',
				templateUrl: '/app/units/profile/profile.tmpl.html',
				controller: 'ProfileCtrl as vm',
				data: {
					title: 'User Profile',
				},
			});
	});
