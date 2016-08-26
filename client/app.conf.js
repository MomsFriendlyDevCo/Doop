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
	});
