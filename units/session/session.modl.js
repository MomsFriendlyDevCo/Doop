angular
	.module('app')
	.factory('SessionModl', function($resource) {
		return $resource('/api/session',{}, {
			profile: { url: '/api/session/profile' },
			login: { url: '/api/session/login', method: 'POST' },
			logout: { url: '/api/session/logout', method: 'POST' },
			recover: {url: '/api/users/recover', method: 'POST' },
		});
	});
