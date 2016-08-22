(function() {
	angular
		.module('app')
		.factory('SessionModl', function($resource) {
			return $resource('/api/session',{}, {
				login: { url: '/api/session/login', method: 'POST' },
				logout: { url: '/api/session/logout', method: 'POST' },
				resetPass: { url: '/action/resetpass', method: 'POST' },
				resetPassNew: { url: '/action/resetpass/:token', method: 'POST' },
			});
		});
})();
