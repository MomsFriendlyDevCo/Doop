angular
	.module('app')
	.factory('Logs', function($resource) {
		return $resource('/api/logs/:id', {}, {
			create: {url: '/api/logs/:model/:docId', method: 'POST'},
		});
	})