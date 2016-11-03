angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('users-list', {
				url: '/users',
				templateUrl: '/units/users/list.tmpl.html',
				controller: 'UsersListCtrl as $ctrl',
				data: {
					title: 'Manage Users',
				},
			})
	});
