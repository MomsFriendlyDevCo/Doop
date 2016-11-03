angular
	.module('app')
	.factory('UsersModl', function($resource) {
		return $resource('/api/users',{}, {
		});
	});
