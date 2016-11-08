angular
	.module('app')
	.factory('Users', function($resource) {
		return $resource('/api/users/:id',{}, {
			create: {method: 'POST', url: '/api/users'},
			meta: {method: 'GET', url: '/api/users/meta?collectionEnums=true'},
		});
	});
