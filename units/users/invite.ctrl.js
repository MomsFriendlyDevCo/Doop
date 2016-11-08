angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('users-invite', {
				url: '/users/invite',
				component: 'usersInviteCtrl',
				data: {
					title: 'Invite User',
					breadcrumbs: [
						{title: 'Manage Users', url: '/users'},
					],
				},
			})
	})
	.component('usersInviteCtrl', {
		templateUrl: '/units/users/invite.tmpl.html',
		controller: function($scope, $location, $toast, Users) {
			var $ctrl = this;

			$ctrl.user = {email: ''};

			$ctrl.invite = function() {
				Users.create({
					email: $ctrl.user.email,
					username: $ctrl.user.email,
				}).$promise
					.then(data => $location.path('/users'))
					.catch($toast.catch)
			};
		},
	});
