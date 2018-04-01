angular
	.module('app')
	.run($router => $router.when('/debug/services/config').component('debugServicesConfigCtrl'))
	.component('debugServicesConfigCtrl', {
		controller: function($config) {
			var $ctrl = this;
			$ctrl.$config = $config;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/config">$config</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$config</h3>
					</div>
					<div class="panel-body">
						<pre>{{$ctrl.$config | json}}</pre>
					</div>
				</div>
			</div>
		`,
	});
