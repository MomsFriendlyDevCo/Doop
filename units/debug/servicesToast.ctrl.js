angular
	.module('app')
	.run($router => $router.when('/debug/services/toast').component('debugServicesToastCtrl'))
	.component('debugServicesToastCtrl', {
		controller: function($toast) {
			var $ctrl = this;
			$ctrl.$toast = $toast;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/toast">$toast</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$toast</h3>
					</div>
					<div class="list-group">
						<a class="list-group-item" ng-click="$ctrl.$toast.primary('Hello World')">$toast.primary('Hello World')</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.info('Hello World')">$toast.info('Hello World')</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.success('Hello World')">$toast.success('Hello World')</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.warning('Hello World')">$toast.warning('Hello World')</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.error('Hello World')">$toast.error('Hello World')</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.save()">$toast.save()</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.catch()">$toast.catch()</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.progress('debug', 'Thinking...', 25)">$toast.progress('debug', 'Thinking...', 25)</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.progress('debug', 50)">$toast.progress('debug', 50)</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.progress('debug', 100)">$toast.progress('debug', 100)</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.catch({error: 'Hello World'})">$toast.catch({error: 'Hello World'})</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.offline(true)">$toast.offline()</a>
						<a class="list-group-item" ng-click="$ctrl.$toast.offline(false)">$toast.offline(false)</a>
					</div>
				</div>
			</div>
		`,
	});
