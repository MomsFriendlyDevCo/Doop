/**
 * App client bootstrapper and initialiser
 */
(function() {
	angular
		.module('app', [
			/*
			* External Angular modules
			*/
			'ui.router',

			/**
			* App modules
			*/
			'app.partials',
		]);
})();
