/**
* Service to populate information about a site instance and return it as a singleton object
*/
angular
	.module('app')
	.service('ConfigServ', function($rootScope) {
		return {
			title: 'Doop',
		};
	});
