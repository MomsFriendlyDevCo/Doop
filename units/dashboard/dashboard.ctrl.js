angular
	.module('app')
	.run($router => $router.when('/').component('dashCtrl'))
	.component('dashCtrl', {
		templateUrl: '/units/dashboard/dashboard.tmpl.html',
		controller: function($scope, $auth) {
			var $ctrl = this;

			// Define visibility control for this controller
			$auth.ensureAuthenticated();

			$ctrl.refresh = function() {
				// return $promise
			};

			$scope.$evalAsync($ctrl.refresh);
		},
	});
