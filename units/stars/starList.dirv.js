/**
* Display a list widget showing the users starred pages
*/
angular
	.module('app')
	.component('starList', {
		controller: function($loader, $prompt, $q, $scope, $session, $toast, Stars) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.stars;
			$ctrl.refresh = ()=> {
				if (!$session.isLoggedIn) return;

				$q.resolve()
					.then($loader.startBackground($scope.$id))
					.then(()=> Stars.query().$promise)
					.then(data => $ctrl.stars = data)
					.catch($toast.catch)
					.finally(()=> $loader.stop($scope.$id))
			}
			// }}}

			// Remove stars {{{
			$ctrl.removeStar = link =>
				$q.resolve()
					.then(()=> $prompt.confirm({
						title: 'Remove star',
						body: 'Are you sure you want to remove this star?',
					}))
					.then(()=> $loader.startBackground(`${$scope.$id}-remove`))
					.then(()=> Stars.toggle({link: link}).$promise)
					.then(()=> $ctrl.refresh())
					.catch($toast.catch)
					.finally(()=> $loader.stop(`${$scope.$id}-remove`))
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
		template: `
			<ul ng-if="$ctrl.stars.length" class="dropdown-menu">
				<li ng-repeat="star in $ctrl.stars">
					<a href="#{{star.link}}">
						<span ng-click="$event.preventDefault(); $ctrl.removeStar(star.link)" class="fa-stack fa-lg">
							<i class="fa fa-stack-1x fa-star star-outer"></i>
							<i class="fa fa-stack-1x fa-star-o star-inner"></i>
						</span>
						<span ng-if="star.breadcrumbs">
							<ol class="breadcrumb">
								<li ng-repeat="breadcrumb in star.breadcrumbs">
									{{breadcrumb.title}}
								</li>
							</ol>
						</div>
						<span ng-if="!star.breadcrumbs && star.title">{{star.title}}</span>
						<span ng-if="!star.breadcrumbs && !star.title">{{star.link}}</span>
					</a>
				</li>
			</ul>
			<div ng-if="!$ctrl.stars.length" class="alert alert-info">
				You have no starred items. Click the star icon in the top-right of pages to add them here.
			</div>
		`,
	});
