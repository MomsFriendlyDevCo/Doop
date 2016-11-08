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
	.run(function($loader, $transitions) {
		$transitions.onStart({}, _=> $loader.clear().start('stateChange'));
		$transitions.onSuccess({}, _=> $loader.stop('stateChange'));
		$transitions.onError({}, _=> $loader.stop('stateChange'));
	})

	/**
	* Router: Restrict every page except /login
	* If the user is NOT logged in redirect to /login in all instances
	*/
	.run(function($location, $rootScope, $session, $transitions) {
		$transitions.onStart({}, function(trans) {
			if (
				!$session.isLoggedIn && // User is not logged in AND
				!/^session-/.test(trans.to().name) // Route does not begin with 'session-' (login, signup, logout etc.)
			) {
				if ($session.isUpdated) { // User isn't logged in and we have confirmed this with a trip to the server
					$location.path('/login');
				} else { // User MIGHT not be logged in because we havn't talked to the server yet
					var unwatcher = $rootScope.$on('session.updated', function() { // Ask to be updated when the server replies
						if (!$session.isLoggedIn) $location.path('/login'); // Server has responded the user isn't logged in
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
	.run(function($transitions) {
		$transitions.onSuccess({}, _=> {
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
	.run(function($transitions) {
		$transitions.onSuccess({}, _=> $('div[ui-view=main]').find('input[autofocus]').focus());
	})

	/**
	* Router: Reattach 'waves' effect on every router reload
	*/
	.run(function($transitions) {
		$transitions.onSuccess({}, _=> Waves.init());
	})

	/**
	* Router: Adjust page title when the state changes
	*/
	.run(function($config, $state, $transitions) {
		$transitions.onSuccess({}, _=> document.title = $config.title + ($state.current.data && $state.current.data.title ? ' | ' + $state.current.data.title : ''));
	})
