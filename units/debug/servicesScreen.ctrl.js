angular
	.module('app')
	.run($router => $router.when('/debug/services/screen').component('debugServicesScreenCtrl'))
	.component('debugServicesScreenCtrl', {
		controller: function($screen) {
			var $ctrl = this;
			$ctrl.$screen = $screen;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/screen">$screen</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$screen</h3>
					</div>
					<div class="panel-body">
						<pre>{{$ctrl.$screen | json}}</pre>
					</div>
				</div>
			</div>
		`,
	});
