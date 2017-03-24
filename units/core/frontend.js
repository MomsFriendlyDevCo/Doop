/**
 * App client entry-point and initialiser
 */
angular
	.module('app', [
		'angular-bs-confirm',
		'angular-bs-popover',
		'angular-bs-tooltip',
		'angular-mfdc-router',
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
		$ctrl.$config = $config;
		$ctrl.$session = $session;
	})
	// }}}

	// Anglar core config {{{
	// Enable async HTTP for performance boost {{{
	.config(function($httpProvider) {
		$httpProvider.useApplyAsync(true);
	})
	// }}}

	// Configure $location to not stupidly encode URLS {{{
	.config(function($locationProvider) {
		$locationProvider.hashPrefix(''); // URL Mode: http://domain/#/path
	})
	// }}}

	// Add additional methods to $location - $location.redirect {{{
	.config($provide => $provide.decorator('$location', $delegate => {
		/**
		* Add $location.redirect
		* This is a very simple wrapper around window.location but keeps things consistant by providing it within the $location handler
		* @param {string} url A full or partial URL to redirect to
		*/
		$delegate.redirect = url => window.location = url;
		return $delegate;
	}))
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
		$router.tokenRule(':id', id => /^[0-9a-f]{24}$/.test(id));
	})
	// }}}

	// Ensure all pages have a trailing slash when using a hashpath (e.g. `http://something#/something` -> `http://something/#/something {{{
	.run(function($window) {
		if ($window.location.pathname != '/' && !$window.location.pathname.endsWith('/')) $window.location.pathname += '/';
	})
	// }}}

	// If no route matches go to '/' {{{
	.run(function($router) {
		$router.rule().priority('lowest').redirect('/');
	})
	// }}}

	// Redirect any page navigation (that is not in an array of approved ones) to /login if the user is not logged in {{{
	.run(function($rootScope, $session, $window) {
		/**
		* Array of applicable $window.location.pathnames to allow without redirecting to /login
		* This is an array of strings or RegExps to match against
		* @var {array}
		*/
		var compareSegment = 'hash'; // Which part of $window.location to examine for the below paths. ENUM: hash, pathname
		var allowedPaths = [
			'/login', '/logout',
			'/signup', /^\/validate/i,
			'/recover-password', /^\/reset/i, '/login/recover',
			/^\/docs/i,
		];

		$rootScope.$on('$routerStart', function(e, rule) {
			if (!rule) return; // No route figured out yet

			var segmentValue = '/' + _.trim($window.location[compareSegment], '/#'); // Crop rubbish from beginning + end of segment string

			if (allowedPaths.find(i => // Allowed path - skip redirect
				(_.isString(i) && segmentValue == i) // Match against strings
				|| (_.isRegExp(i) && i.test(segmentValue)) // Match against RegExps
			)) return;

			$session.promise() // Ask session if we are logged in
				.catch(_=> $window.location = '/login') // Not logged in - redirect to /login
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
		$rootScope.$on('$routerSuccess', _=> {
			// NOTE: All the below attachment rules assumes `waves-effect` is applied anyway
			$('.btn').addClass('waves-effect');
			$('.btn-circle').addClass('waves-circle');
			$('.input-group > .btn').addClass('waves-table-cell');
			$('a.list-group-items, .dropdown-menu > li > a, .main-menu > li > a').addClass('waves-effect waves-block');

			// Re-init
			Waves.init();
		});
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
	// Configure Selectize {{{
	.config(function(uiSelectConfig) {
		uiSelectConfig.theme = 'selectize';
	})
	// }}}
	// }}}
