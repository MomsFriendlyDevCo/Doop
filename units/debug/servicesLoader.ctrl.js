angular
	.module('app')
	.run($router => $router.when('/debug/services/loader').component('debugServicesLoaderCtrl'))
	.component('debugServicesLoaderCtrl', {
		controller: function($loader) {
			var $ctrl = this;
			$ctrl.$loader = $loader;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/loader">$loader</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$loader</h3>
					</div>
					<div class="list-group">
						<a class="list-group-item" ng-click="$ctrl.$loader.start('debug1')">$loader.start("debug1")</a>
						<a class="list-group-item" ng-click="$ctrl.$loader.stop('debug1')">$loader.stop("debug1")</a>
						<a class="list-group-item" ng-click="$ctrl.$loader.startBackground('debug2')">$loader.startBackground("debug2")</a>
						<a class="list-group-item" ng-click="$ctrl.$loader.stop('debug2')">$loader.stop("debug2")</a>
						<a class="list-group-item" ng-click="$ctrl.$loader.start('debug3', false)">$loader.start("debug3", false)</a>
						<a class="list-group-item" ng-click="$ctrl.$loader.stop('debug3')">$loader.stop("debug3")</a>
					</div>
				</div>
			</div>
		`,
	});
