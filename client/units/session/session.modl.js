angular
	.module('app')
	.factory('SessionModl', function($resource) {
		return $resource('/api/session',{}, {
			profile: { url: '/api/session/profile' },
			login: { url: '/api/session/login', method: 'POST' },
			logout: { url: '/api/session/logout', method: 'POST' },
			resetPass: { url: '/action/resetpass', method: 'POST' },
			resetPassNew: { url: '/action/resetpass/:token', method: 'POST' },
		});
	});
