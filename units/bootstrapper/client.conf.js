/**
* Angular app configuration file
*/
angular
	.module('app')

	// Anglar core config {{{
	.config(function($httpProvider) {
		// Enable async HTTP for performance boost
		$httpProvider.useApplyAsync(true);
	})
	// }}}

	// Router config {{{

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
			var allowComponents = ['loginCtrl', 'logoutCtrl', 'usersInviteCtrl', 'usersInviteAcceptCtrl'];
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

	// FIXME: Defunct
	/**
	* Router: Restrict every page except /login
	* If the user is NOT logged in redirect to /login in all instances
	*/
	/*
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
	*/

	// }}}
