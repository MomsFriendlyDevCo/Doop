/**
 * Angular app configuration file
 */
(function() {
	angular
		.module('app')
		.config($httpProvider => {
			// Enable async HTTP for performance boost
			$httpProvider.useApplyAsync(true);
		});
})();
