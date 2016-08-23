/**
 * App client bootstrapper and initialiser
 */
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
