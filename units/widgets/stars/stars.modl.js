angular
	.module('app')
	.factory('Stars', function($resource) {
		return $resource('/api/stars', {}, {
			get: {method: 'GET', url: '/api/stars/byLink?link=:link'},
			query: {method: 'GET', url: '/api/stars', isArray: true},
			toggle: {method: 'POST', url: '/api/stars'},
		});
	})
