/**
 * Angular app configuration file
 */
(function() {
	angular
		.module('app')
		.config($httpProvider => {
			// Enable async HTTP for performance boost
			$httpProvider.useApplyAsync(true);
		})

		/**
		 * Initial / default route configuration
		 */
		.config($urlRouterProvider => {
			// States are defined in their corresponding module

			// For any unmatched url, redirect to /
			$urlRouterProvider.otherwise('/');
		});
})();
