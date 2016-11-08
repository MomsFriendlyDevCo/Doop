angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('dashboard', {
				url: '/',
				component: 'dashCtrl',
				data: {
					title: 'Dashboard',
				},
			});
	})
	.component('dashCtrl', {
		templateUrl: '/units/dashboard/dashboard.tmpl.html',
		controller: function($scope, $auth, $state) {
			var $ctrl = this;

			// Define visibility control for this controller
			$auth.ensureAuthenticated();

			$ctrl.refresh = function() {
				// return $promise
			};

			$scope.$evalAsync($ctrl.refresh);
		},
	});
