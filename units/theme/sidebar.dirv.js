angular
	.module('app')
	.component('sidebar', {
		templateUrl: '/units/theme/sidebar.tmpl.html',
		controller: function($element, $rootScope, $router, $session) {
			var $ctrl = this;
			$ctrl.$session = $session;

			$ctrl.areas; // Array of each section of the route (seperated by -; e.g. '#/foo/bar' => [foo,bar])
			$ctrl.area; // First segment of $scope.areas

			$rootScope.$on('$routerSuccess', ()=> {
				if (!$router.path) return; // Router not ready yet
				$ctrl.areas = $router.path.split('/').slice(1); // Split into path segments (remove first empty element)
				$ctrl.area = this.areas[0];
			});

			$('.sidebar-toggle').click(()=> {
				$('body').toggleClass('sidebar-toggled');
				$('.hi-trigger, #sidebar').toggleClass('toggled');
			});

			// Close sidebar when in mobile mode on any click event
			$element.on('click', 'a', function() {
				if ($(this).data('toggle') == 'collapse') return; // Ignore menus that collapse
				$('body').removeClass('sidebar-toggled');
				$('.hi-trigger, #sidebar').removeClass('toggled');
			});

		},
	});
