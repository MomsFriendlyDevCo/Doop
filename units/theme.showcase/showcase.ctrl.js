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
		templateUrl: '/units/theme.showcase/showcase.tmpl.html',
		controller: function($scope, $loader, $state, $toast) {
			var $ctrl = this;

			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;
		},
	});
