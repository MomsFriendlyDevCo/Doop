angular
	.module('app')
	.run($router => $router.when('/debug/services/session').component('debugServicesSessionCtrl'))
	.component('debugServicesSessionCtrl', {
		controller: function($session) {
			var $ctrl = this;
			$ctrl.$session = $session;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/session">$session</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$session.data</h3>
					</div>
					<div class="panel-body">
						<pre>{{$ctrl.$session.data | json}}</pre>
					</div>
				</div>
			</div>
		`,
	});
