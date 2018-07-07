angular
	.module('app')
	.factory('Logs', function($resource) {
		return $resource('/api/logs/:model/:docId', {}, {
			create: {url: '/api/logs/:model/:docId', method: 'POST'},
			tags: {url: '/api/logs/:model/:docId/tags', isArray: true},
		});
	})
