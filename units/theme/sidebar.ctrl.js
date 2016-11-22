angular
	.module('app')
	.controller('SidebarCtrl', function($scope, $rootScope) {
		this.areas; // Array of each section of the route (seperated by -; e.g. '#/foo/bar' => [foo,bar])
		this.area; // First segment of $scope.areas

		$rootScope.$on('$stateChangeSuccess', (e, newState, newParams, oldState, oldParams) => {
			if (!newState.name) return; // Router not ready yet
			this.areas = newState.name.split('-');
			this.area = this.areas[0];
		});

		$('.sidebar-toggle').click(_=> {
			$('body').toggleClass('sidebar-toggled');
			$('.hi-trigger, #sidebar').toggleClass('toggled');
		});
	});
