/**
 * App client bootstrapper and initialiser
 */
(function() {
	angular
		.module('app', [
			/*
			* External Angular modules
			*/
			'ngResource',
			'ui.router',

			/**
			* App modules
			*/
			'app.partials',
		]);
})();
