/**
* Angular app configuration file
*/
angular
	.module('app')
	.config(function($httpProvider) {
		// Enable async HTTP for performance boost
		$httpProvider.useApplyAsync(true);
	})

	/**
	* Initial / default route configuration
	*/
	.config(function($urlRouterProvider) {
		// States are defined in their corresponding unit

		// For any unmatched url, redirect to /
		$urlRouterProvider.otherwise('/');
	})

	/**
	* Router: Loader display while routing
	*/
	.run(function($rootScope, $loader, $state) {
		$rootScope.$on('$stateChangeStart', _=> $loader.clear().start('stateChange'));
		$rootScope.$on('$stateChangeSuccess', _=> $loader.stop('stateChange'));
		$rootScope.$on('$stateChangeError', _=> $loader.stop('stateChange'));
	})

	/**
	* Router: Restrict every page except /login
	* If the user is NOT logged in redirect to /login in all instances
	*/
	.run(function($location, $rootScope, SessionServ) {
		$rootScope.$on('$stateChangeStart', function(e, newState, fromState) {
			if (
				!SessionServ.isLoggedIn && // User is not logged in AND
				!/^session-/.test(newState.name) // Route does not begin with 'session-' (login, signup, logout etc.)
			) {
				if (SessionServ.isUpdated) { // User isn't logged in and we have confirmed this with a trip to the server
					$location.path('/login');
				} else { // User MIGHT not be logged in because we havn't talked to the server yet
					var unwatcher = $rootScope.$on('session.updated', function() { // Ask to be updated when the server replies
						if (!SessionServ.isLoggedIn) $location.path('/login'); // Server has responded the user isn't logged in
						unwatcher(); // Release the $on watcher
					});
				}
			}
		});
	})

	/**
	* Router: Cleanup on page exit
	* Destroys any open Bootstrap modals, tooltips or popovers
	*/
	.run(function($rootScope) {
		$rootScope.$on('$stateChangeStart', function() {
			// Destory any open Bootstrap modals
			$('body > .modal-backdrop').remove();

			// Destroy any open Bootstrap tooltips
			$('body > .tooltip').remove();

			// Destroy any open Bootstrap popovers
			$('body > .popover').remove();
		});
	})

	/**
	* Router: Focus any input element with the 'autofocus' attribute on state change
	*/
	.run(function($rootScope) {
		$rootScope.$on('$stateChangeSuccess', function() {
			$('div[ui-view=main]').find('input[autofocus]').focus();
		});
	})

	/**
	* Router: Reattach 'waves' effect on every router reload
	*/
	.run(function($rootScope) {
		$rootScope.$on('$stateChangeSuccess', _=> Waves.init());
	})

	/**
	* Router: Adjust page title when the state changes
	*/
	.run(function($rootScope, ConfigServ) {
		$rootScope.$on('$stateChangeStart', function(e, state) {
			document.title = ConfigServ.title + (state.data && state.data.title ? ' | ' + state.data.title : '');
		});
	})
