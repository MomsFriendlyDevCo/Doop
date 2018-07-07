angular
	.module('app')
	.run($router => $router.when('/debug/services/filekit').component('debugServicesFilekitCtrl'))
	.component('debugServicesFilekitCtrl', {
		controller: function($filekit, $http, $loader, $q, $toast) {
			var $ctrl = this;
			$ctrl.$filekit = $filekit;
		},
		template: `
			<div class="card">
				<div class="card-header">
					<h2>$filekit</h2>
				</div>
				<div class="card-body card-padding">
					<p>A service and collection of directives for uploading files</p>
				</div>
				<div class="list-group">
					<a class="list-group-item" ng-click="$ctrl.$filekit.prompt('/api/debug/200')">$filekit.prompt('/api/debug/200')</a>
					<a class="list-group-item" ng-click="$ctrl.$filekit.prompt('/api/debug/403')">$filekit.prompt('/api/debug/403')</a>
					<a class="list-group-item" ng-click="$ctrl.$filekit.prompt('/api/debug/200', true)">$filekit.prompt('/api/debug/200', multiple=true)</a>
				</div>
			</div>
		`,
	});
