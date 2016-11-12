/**
* Service to populate information about a site instance and return it as a singleton object
* NOTE: You can import variables from elsewhere in Doop while this script is being compiled by using something similar to the following:
* {
* 	something: 0/*$IMPORT: app.config.some.variable
* }
* AGAIN NOTE: the above quote is impomplete as the remaining 'asterisk plus forwardslash' buggers up the script compiler
*/
angular
	.module('app')
	.service('$config', function($rootScope) {
		return {
			isProduction: 0/*IMPORT: app.config.isProduction*/,
			title: 0/*IMPORT: app.config.title*/,
			profiles: 0/*IMPORT: app.config.profiles*/,
		};
	});
