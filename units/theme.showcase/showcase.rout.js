angular
	.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('showcase', {
				url: '/showcase',
				templateUrl: '/units/theme.showcase/showcase.tmpl.html',
				controller: 'ShowcaseCtrl as $ctrl',
				data: {
					title: 'Theme Showcase',
				},
			})
	});
