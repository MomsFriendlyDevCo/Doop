angular
	.module('app')
	.run($router => $router.when('/').title('Dashboard').component('dashboardCtrl'))
	.component('dashboardCtrl', {
		templateUrl: '/units/dashboard/dashboard.tmpl.html',
		controller: function($scope) {
			var $ctrl = this;

			$ctrl.refresh = ()=> {
			};

			$scope.$evalAsync($ctrl.refresh);
		},
	});
