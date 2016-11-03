angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('debug', {
				url: '/debug',
				templateUrl: '/units/debug/debug.tmpl.html',
				controller: 'DebugCtrl as $ctrl',
				data: {
					title: 'Debugging',
				},
			})
	});
