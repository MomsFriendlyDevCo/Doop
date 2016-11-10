angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('showcase', {
				url: '/showcase',
				component: 'showcaseCtrl',
				data: {
					title: 'Doop Material Showcase',
				},
			})
	})
	.component('showcaseCtrl', {
		templateUrl: '/units/showcase/showcase.tmpl.html',
		controller: function($scope, $config, $loader, $state, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
		},
	});
