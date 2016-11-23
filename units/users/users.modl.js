angular
	.module('app')
	.factory('Users', function($resource) {
		return $resource('/api/users/:id',{}, {
			// Additions to default ReST
			count: {method: 'GET', url: '/api/users/count'},
			create: {method: 'POST', url: '/api/users'},
			meta: {method: 'GET', url: '/api/users/meta?collectionEnums=true&prototype=true'},

			// Session handling
			login: { url: '/api/session/login', method: 'POST' },
			logout: { url: '/api/session/logout', method: 'POST' },
			profile: { url: '/api/session/profile' },
			invite: {method: 'POST', url: '/api/users/invite'},
			inviteAccept: {method: 'POST', url: '/api/sers/inviteAccept'},
			recover: {url: '/api/users/recover', method: 'POST' },
			recoverAccept: {method: 'POST', url: '/api/users/recoverAccept'},
		});
	});
