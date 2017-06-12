angular
	.module('app')
	.component('docsSidebar', {
		controller: function($rootScope, $router) {
			var $ctrl = this;
			$ctrl.areas; // Array of each section of the route (seperated by -; e.g. '#/foo/bar' => [foo,bar])
			$ctrl.area; // First segment of $scope.areas

			$rootScope.$on('$routerSuccess', ()=> {
				if (!$router.path) return; // Router not ready yet
				$ctrl.areas = $router.path.split('/').slice(2); // Split into path segments (remove first empty element & '/docs' prefix)
				$ctrl.area = this.areas[0];
			});
		},
		template: `
			<ul class="main-menu">
				<li ng-class="!$ctrl.area && 'active'">
					<a href="#/">
						<i class="fa fa-fw fa-dashboard"></i>
						Docs Home
					</a>
				</li>

				<li ng-class="$ctrl.area=='erd' && 'active'">
					<a href="#/docs/erd">
						<i class="fa fa-fw fa-sitemap"></i>
						Database ERD
					</a>
				</li>
			</ul>
		`,
	})
