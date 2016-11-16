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
		'ngResource',
		'ui.gravatar',
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
	.config(function($httpProvider) {
		// Enable async HTTP for performance boost
		$httpProvider.useApplyAsync(true);
	})
	// }}}

	// Router config {{{

	// Disable developer warnings if we're in production {{{
	.run(function($config, $router) {
		if ($config.isProduction) $router.warnings(false);
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
		$rootScope.$on('$routerSuccess', (e, rule) => document.title = $config.title + (rule.data && rule.data.title ? ' | ' + rule.data.title : ''));
	})
	// }}}

	// }}}
