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
	* Auth redirect behaviour
	*/
	.run(function($rootScope, $state, SessionServ) {
		$rootScope.$on('$stateChangeStart', (e, toState) => {
			// FIXME: Use `resolve` on a route to ensure session data is defined before access control logic
			SessionServ.update()
				.then(res => {
					// Not authenticated, redirect to login
					if (!_.get(SessionServ, 'data._id') && toState.name != 'login') {
						$state.go('login');
						if (e) e.preventDefault();
						return;
					}

					// Is logged in and trying to access login
					if (_.get(SessionServ, 'data._id') && toState.name == 'login') {
						$state.go('dashboard');
						if (e) e.preventDefault();
						return;
					}
				});
		});
	});
