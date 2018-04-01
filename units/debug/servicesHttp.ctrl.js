angular
	.module('app')
	.run($router => $router.when('/debug/services/http').component('debugServicesHttpCtrl'))
	.component('debugServicesHttpCtrl', {
		controller: function($http, $loader, $q, $toast) {
			var $ctrl = this;

			$ctrl.fetch = url => {
				$q.resolve()
					.then(()=> $http.get(url))
					.then(res => $toast.success(res.data))
					.catch($toast.catch)
					.finally(()=> $loader.stop($scope.$id))
			};
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/http">$http</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$http</h3>
					</div>
					<div class="panel-body">
						<p>Simple controller showing the result of vairious back-end HTTP response codes and how they are automatically handled by <a href="#/debug/services/toast">$toast</a></p>
					</div>
					<div class="list-group">
						<a class="list-group-item" ng-click="$ctrl.fetch('/api/debug/200')">Trigger Code 200</a>
						<a class="list-group-item" ng-click="$ctrl.fetch('/api/debug/403')">Trigger Code 403</a>
						<a class="list-group-item" ng-click="$ctrl.fetch('/api/debug/500')">Trigger Code 500</a>
					</div>
				</div>
			</div>
		`,
	});
