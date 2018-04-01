/**
* Service to populate information about a site instance and return it as a singleton object
* NOTE: You can import variables from elsewhere in Doop while this script is being compiled by using something similar to the following:
* {
* 	something: 0/*$IMPORT: app.config.some.variable
* }
* AGAIN NOTE: the above quote is incomplete as the remaining 'asterisk plus forwardslash' buggers up the script compiler
*/
angular
	.module('app')
	.service('$config', function($rootScope) {
		return {
			url: 0/*IMPORT: app.config.publicUrl*/,
			isProduction: 0/*IMPORT: app.config.isProduction*/,
			title: 0/*IMPORT: app.config.title*/,
			layout: 0/*IMPORT: app.config.layout*/,
			instances: 0/*IMPORT: app.config.instances*/,
			session: {
				signup: 0/*IMPORT: app.config.session.signup*/,
			},
			git: 0/*IMPORT: app.config.git*/,
		};
	});
