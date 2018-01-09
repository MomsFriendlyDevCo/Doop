/**
* Starring widget
* If the user stars something the link to it appears in their $session.user.stars[]
* This is effectively a bookmark
*
* @example
* <star></star>
*/
angular
	.module('app')
	.component('star', {
		controller: function($loader, $location, $q, $router, $scope, $toast, Stars) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.star; // Object containing .isStarred
			$ctrl.refresh = ()=>
				$q.resolve()
					.then(()=> $loader.startBackground($scope.$id))
					.then(()=> Stars.get({link: $location.path()}).$promise)
					.then(data => $ctrl.star = data)
					.finally(()=> $loader.stop($scope.$id))
			// }}}

			// Toggle star {{{
			$ctrl.toggleStar = ()=>
				$q.resolve()
					.then(()=> $loader.startBackground(`${$scope.$id}-toggle`))
					.then(()=> Stars.toggle({
						link: $location.path(),
						title: $router.page._title,
						breadcrumbs: $router.page._breadcrumbs,
					}).$promise)
					.then(()=> $ctrl.refresh())
					.catch($toast.catch)
					.finally(()=> $loader.stop(`${$scope.$id}-toggle`))
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
		template: `
			<a ng-click="$ctrl.toggleStar()" class="pull-right btn btn-link" ng-class="$ctrl.star.isStarred ? 'active' : ''">
				<span class="fa-stack fa-lg">
					<i ng-if="$ctrl.star" class="fa fa-stack-1x fa-star star-outer"></i>
					<i class="fa fa-stack-1x fa-star-o star-inner"></i>
				</span>
			</a>
		`,
	});
