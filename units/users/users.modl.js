angular
	.module('app')
	.factory('Users', function($resource) {
		return $resource('/api/users/:id',{}, {
			create: {method: 'POST', url: '/api/users'},
			invite: {method: 'POST', url: '/api/users/invite'},
			inviteAccept: {method: 'POST', url: '/api/users/inviteAccept'},
			meta: {method: 'GET', url: '/api/users/meta?collectionEnums=true'},
		});
	});
