angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('showcase', {
				url: '/showcase/:id',
				component: 'showcaseCtrl',
				data: {
					title: 'Doop Material Showcase',
				},
			})
	})
	.component('showcaseCtrl', {
		templateUrl: '/units/showcase/showcase.tmpl.html',
		controller: function($scope, $config, $loader, $stateParams, $toast) {
			var $ctrl = this;

			$ctrl.$config = $config;
			$ctrl.$loader = $loader;
			$ctrl.$toast = $toast;

			if ($stateParams.id) $(document).scrollTop($('#' + $stateParams.id.replace(/[^a-z0-9-]+/g, '_')).position().top - 50);
		},
	});
