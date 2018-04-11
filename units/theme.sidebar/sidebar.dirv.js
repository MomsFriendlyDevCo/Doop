angular
	.module('app')
	.component('sidebar', {
		templateUrl: '/units/theme.sidebar/sidebar.tmpl.html',
		controller: function($scope, $sitemap, $element, $rootScope, $router, $screen, $session, $window) {
			var $ctrl = this;
			$ctrl.$session = $session;
			$ctrl.$sitemap = $sitemap;

			$ctrl.searchTerm = '';
			$ctrl.areas; // Array of each section of the route (seperated by -; e.g. '#/foo/bar' => [foo,bar])
			$ctrl.area; // First segment of $scope.areas
			$ctrl.query;

			$rootScope.$on('$routerSuccess', ()=> {
				if (!$router.path) return; // Router not ready yet
				$ctrl.areas = $router.path.split('/').slice(1); // Split into path segments (remove first empty element)
				$ctrl.area = this.areas[0];
				$ctrl.query = $router.query;
			});

			$('.sidebar-toggle').click(()=> {
				$('body').toggleClass('sidebar-toggled');
				$('.hi-trigger, #sidebar').toggleClass('toggled');
			});

			// Close sidebar when in mobile mode on any click event
			$element.on('click', 'a', function() {
				if (!$screen.isMobile) return; // Don't bother if we're not mobile
				if ($(this).data('toggle') == 'collapse') return; // Ignore menus that collapse
				$('#container').removeClass('mainnav-in').addClass('mainnav-sm');
				$('.navbar-brand img.brand-icon').attr('src', $('.navbar-brand img.brand-icon').data('src-sm'));
			});

			// Toggle the size of the sidebar when a.mainnav-toggle gets clicked {{{
			$('.mainnav-toggle').click(function() {
				// Starting base - this occurs on page refresh.
				if (!$('#container').hasClass('mainnav-sm') && !$('#container').hasClass('mainnav-in')) {
					// Phone and tablet size screens
					if ($(window).width() < 768) $('#container').addClass('mainnav-sm');
				}

				if ($('#container').hasClass('mainnav-sm')) {
					// Large mode
					$('#container').addClass('mainnav-in').removeClass('mainnav-sm');
					$('.navbar-brand img.brand-icon').attr('src', $('.navbar-brand img.brand-icon').data('src-lg'));
				} else {
					// Small mode
					$('#container').addClass('mainnav-sm').removeClass('mainnav-in');
					$('.navbar-brand img.brand-icon').attr('src', $('.navbar-brand img.brand-icon').data('src-sm'));
				}
			});
			// }}}
		},
	})
