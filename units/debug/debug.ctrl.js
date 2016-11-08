angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('debug', {
				url: '/debug',
				component: 'debugCtrl',
				data: {
					title: 'Debugging',
				},
			})
	})
	.component('debugCtrl', {
		templateUrl: '/units/debug/debug.tmpl.html',
		controller: function($scope, $loader, $state, $toast) {
			var $ctrl = this;

			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
		},
	});
