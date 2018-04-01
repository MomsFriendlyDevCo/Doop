angular
	.module('app')
	.factory('StatusChange', function($resource) {
		return $resource('/api/middleware.statusChanges/:id', {}, {
			schema: {method: 'GET', url: '/api/middleware.statusChanges/:collection'},
			schemaMermaid: {method: 'GET', url: '/api/middleware.statusChanges/:collection/mermaid', isArray: true},
		});
	})
