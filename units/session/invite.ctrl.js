angular
	.module('app')
	.config(function($urlRouterProvider) {
		// Install the /invite suffix so it routes BEFORE users-edit
		$urlRouterProvider.when('/users/invite', $state => $state.go('users-invite'));
	})
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
			$ctrl.error;

			$ctrl.invite = function() {
				Users.invite({
					emails: $ctrl.user.email.split(/[\s\n,]+/),
				}).$promise
					.then(data => $location.path('/users'))
					.catch(res => $ctrl.error = res.data.error);
			};
		},
	});
