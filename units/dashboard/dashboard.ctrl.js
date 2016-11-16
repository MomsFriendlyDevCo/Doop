angular
	.module('app')
	.run($router => $router.when('/').component('dashCtrl'))
	.component('dashCtrl', {
		templateUrl: '/units/dashboard/dashboard.tmpl.html',
		controller: function($scope) {
			var $ctrl = this;

			$ctrl.refresh = function() {};

			$scope.$evalAsync($ctrl.refresh);
		},
	});
