/**
 * App client entry-point and initialiser
 */
angular
	.module('app', [
		/*
		* External Angular modules
		*/
		'angular-bs-confirm',
		'angular-bs-popover',
		'angular-bs-tooltip',
		'angular-ui-loader',
		'ngAnimate',
		'ngResource',
		'ngSanitize',
		'ui.gravatar',
		'ui.select',
		'ui-notification',
		'uiSwitch',
	])

	// Global controller {{{
	.controller('GlobalCtrl', function($config, $rootScope, $scope, $session) {
		var $ctrl = this;
		// Init user session object/data
		$ctrl.config = $config;
		$ctrl.session = $session;
	})
	// }}}

	// Anglar core config {{{
	// Enable async HTTP for performance boost {{{
	.config(function($httpProvider) {
		$httpProvider.useApplyAsync(true);
	})
	// }}}

	// Add additional methods to $resource {{{
	.config(function($resourceProvider) {
		angular.extend($resourceProvider.defaults.actions, {
			count: {
				method: 'GET',
				params: {
					id: 'count',
				},
			},
			create: {
				method: 'POST',
			},
			meta: {
				method: 'GET',
				params: {
					id: 'meta',
					collectionEnums: true,
					prototype: true,
				},
			},
		});
	})
	// }}}
	// }}}

	// Router config {{{

	// Disable developer warnings if we're in production {{{
	.run(function($config, $router) {
		if ($config.isProduction) $router.warnings(false);
	})
	// }}}

	// Validate ':id' against a 24 bit hex string if seen in a URL {{{
	.run(function($router) {
		$router.tokenRule(':id', id => /^[0-9a-f]+$/.test(id));
	})
	// }}}

	// If no route matches go to '/' {{{
	.run(function($router) {
		$router.rule().priority('lowest').redirect('/');
	})
	// }}}

	// Redirect any page navigation (that is not in an array of approved ones) to /login if the user is not logged in {{{
	.run(function($location, $rootScope, $session) {
		$rootScope.$on('$routerStart', function(e, rule) {
			if (!rule) return; // No route figured out yet
			// Array of component names that we will allow if the user is not logged in
			var allowComponents = ['loginCtrl', 'logoutCtrl', 'sessionRecoverCtrl', 'sessionRecoverAcceptCtrl', 'usersInviteCtrl', 'usersInviteAcceptCtrl'];
			if (_.includes(allowComponents, rule._component)) return; // Component is already approved - do nothing
			$session.promise() // Ask session if we are logged in
				.catch(_=> $location.path('/login')) // Not logged in - redirect to /login
		});
	})
	// }}}

	// Add helper classes to the body element when were routing {{{
	.run(function($rootScope, $timeout) {
		// add .router-routing class to body when routing and remove it 1s after we have finished loading (i.e. everything has settled)
		$rootScope.$on('$routerStart', _=> angular.element('body').addClass('router-routing'))
		$rootScope.$on('$routerSuccess', _=> $timeout(_=> angular.element('body').removeClass('router-routing'), 1000));
		$rootScope.$on('$routerError', _=> $timeout(_=> angular.element('body').removeClass('router-routing'), 1000));
	})
	// }}}

	// Animate the page loader while navigating {{{
	.run(function($loader, $rootScope) {
		$rootScope.$on('$routerStart', _=> $loader.clear().start('routerNav'));
		$rootScope.$on('$routerSuccess', _=> $loader.stop('routerNav'));
		$rootScope.$on('$routerError', _=> $loader.stop('routerNav'));
	})
	// }}}

	// Cleanup Bootstrap elements on navigation {{{
	.run(function($rootScope) {
		$rootScope.$on('$routerStart', _=> {
			// Destory any open Bootstrap modals
			$('body > .modal-backdrop').remove();

			// Destroy any open Bootstrap tooltips
			$('body > .tooltip').remove();

			// Destroy any open Bootstrap popovers
			$('body > .popover').remove();
		});
	})
	// }}}

	// Focus any input element post-navigation {{{
	.run(function($rootScope) {
		$rootScope.$on('$routerSuccess', _=> $('div[ui-view=main]').find('input[autofocus]').focus());
	})
	// }}}

	// Reattach 'waves' effect on every router reload {{{
	.run(function($rootScope) {
		$rootScope.$on('$routerSuccess', _=> Waves.init());
	})
	// }}}

	// Adjust page title when the page changes {{{
	.run(function($config, $rootScope) {
		$rootScope.$on('$routerSuccess', (e, rule) => document.title = $config.title + (_.has(rule, '_data.title') ? ' | ' + rule._data.title : ''));
	})
	// }}}

	// Page load animation {{{
	.run(function($animate, $rootScope) {
		$rootScope.$on('$routerStart', _=> {
			var pageArea = angular.element('#content');
			$animate.addClass(pageArea, 'fadeInUp')
				.then(_=> $animate.removeClass(pageArea, 'fadeInUp'));
		});
	})
	// }}}

	// }}}

	// Theme {{{
	.config(function(uiSelectConfig) {
		uiSelectConfig.theme = 'selectize';
	})
	// }}}
